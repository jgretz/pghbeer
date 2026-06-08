import {z} from 'zod';

import {beverageTypeEnum, type BeverageType} from 'database';

import type {ParsedBeer} from './parse-beers.ts';
import type {Classification} from './classify.ts';

const DEFAULT_CLI =
  process.env.OTTER_RUNWAY_CLI ?? '/Users/joshgretz/Development/Gretz/otter/apps/runway/src/cli.ts';

const PROJECT = {
  id: '96812bc5-b0ee-4a86-99df-f4456d924875',
  name: 'pghbeer',
  workingDir: '/Users/joshgretz/Development/Gretz/pghbeer',
} as const;

const TERMINAL = new Set(['success', 'error', 'crashed', 'cancelled', 'api_error']);

/** Outcome of one runway job — success means the success-check (output file) passed. */
export type JobOutcome = {ok: true} | {ok: false; error: string};

/** The shell-out boundary, injectable so tests can stub runway entirely. */
export type ExecuteJob = (args: {
  cli: string;
  payloadPath: string;
  label: string;
  pollMs: number;
  timeoutMs: number;
}) => Promise<JobOutcome>;

export type RunwayDeps = {
  tmpDir: string;
  runStamp: string;
  cli?: string;
  pollMs?: number;
  execute?: ExecuteJob;
};

function makePayload(prompt: string, outPath: string, timeoutMs: number) {
  return {
    project: PROJECT,
    llm: {provider: 'claude', model: 'default', permissionMode: 'bypassPermissions'},
    agent: {
      orientation: 'worker',
      roleInstructionOverride:
        'You normalize messy festival beer-list data into strict JSON files. ' +
        'You follow the output-path instruction exactly and write only the JSON file.',
    },
    prompt,
    successCheck: {kind: 'fileExists', paths: [outPath]},
    timeoutMs,
    attachBrainMcp: false,
  };
}

/**
 * Run a batch, returning its results map plus a `failed` flag instead of
 * throwing — so a downed daemon degrades to "those items unresolved" rather
 * than aborting the whole import.
 */
export async function safeBatch<T>(
  run: () => Promise<Map<string, T>>,
  label: string,
): Promise<{results: Map<string, T>; failed: boolean}> {
  try {
    return {results: await run(), failed: false};
  } catch (error) {
    console.error(`${label} batch failed:`, error);
    return {results: new Map(), failed: true};
  }
}

/** Real runway shell-out: enqueue then poll status to a terminal state. */
export const executeRunwayJob: ExecuteJob = async ({
  cli,
  payloadPath,
  label,
  pollMs,
  timeoutMs,
}) => {
  const enq =
    await Bun.$`bun ${cli} enqueue --file ${payloadPath} --caller pghbeer --caller-job-id ${label}`
      .quiet()
      .nothrow();
  if (enq.exitCode !== 0) {
    return {
      ok: false,
      error: `enqueue failed: ${enq.stderr.toString().trim() || `exit ${enq.exitCode}`}`,
    };
  }
  const jobId = enq.stdout.toString().trim();
  if (!jobId) return {ok: false, error: 'enqueue returned no job id'};

  const deadline = Date.now() + timeoutMs + 60_000;
  while (Date.now() < deadline) {
    await Bun.sleep(pollMs);
    const st = await Bun.$`bun ${cli} status ${jobId}`.quiet().nothrow();
    if (st.exitCode !== 0) {
      return {
        ok: false,
        error: `status failed: ${st.stderr.toString().trim() || `exit ${st.exitCode}`}`,
      };
    }
    let job: {status?: string; exitReason?: string | null};
    try {
      job = JSON.parse(st.stdout.toString());
    } catch {
      continue; // transient non-JSON; keep polling
    }
    if (job.status && TERMINAL.has(job.status)) {
      return job.status === 'success'
        ? {ok: true}
        : {ok: false, error: `job ${job.status}${job.exitReason ? `: ${job.exitReason}` : ''}`};
    }
  }
  return {ok: false, error: `timed out waiting for job ${jobId}`};
};

/**
 * Generic batched runway call: write the items + a prompt that tells the runner
 * to write a keyed `{results:[...]}` file, run one job, then read+validate the
 * file into a `key → result` map. Items whose result is missing/invalid are
 * simply absent from the map (the caller treats them as unresolved).
 */
async function runBatch<S extends z.ZodType<{key: string}>>(
  deps: RunwayDeps,
  args: {
    kind: string;
    items: unknown[];
    buildPrompt: (inPath: string, outPath: string) => string;
    itemSchema: S;
  },
): Promise<Map<string, z.infer<S>>> {
  const cli = deps.cli ?? DEFAULT_CLI;
  const pollMs = deps.pollMs ?? 5_000;
  const timeoutMs = 600_000;
  const inPath = `${deps.tmpDir}/${args.kind}-in-${deps.runStamp}.json`;
  const outPath = `${deps.tmpDir}/${args.kind}-out-${deps.runStamp}.json`;
  const payloadPath = `${deps.tmpDir}/${args.kind}-payload-${deps.runStamp}.json`;

  await Bun.write(inPath, JSON.stringify(args.items, null, 2));
  await Bun.write(
    payloadPath,
    JSON.stringify(makePayload(args.buildPrompt(inPath, outPath), outPath, timeoutMs)),
  );

  const exec = deps.execute ?? executeRunwayJob;
  const outcome = await exec({cli, payloadPath, label: `pghbeer-${args.kind}`, pollMs, timeoutMs});
  if (!outcome.ok) throw new Error(`runway ${args.kind} batch failed: ${outcome.error}`);

  if (!(await Bun.file(outPath).exists())) {
    throw new Error(`runway ${args.kind} batch: output file ${outPath} missing after success`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(await Bun.file(outPath).text());
  } catch (error) {
    throw new Error(`runway ${args.kind} batch: output file is not valid JSON`, {cause: error});
  }

  const results = (parsed as {results?: unknown[]})?.results;
  const map = new Map<string, z.infer<S>>();
  if (Array.isArray(results)) {
    for (const r of results) {
      const v = args.itemSchema.safeParse(r);
      if (v.success) map.set(v.data.key, v.data);
    }
  }
  return map;
}

const beerSchema = z.object({
  name: z.string().min(1),
  style: z.string().nullable().catch(null),
  abv: z.number().nullable().catch(null),
  isNa: z.boolean().catch(false),
});

const parseItemSchema = z.object({key: z.string().min(1), beers: z.array(beerSchema)});

export type ParseBatchItem = {key: string; brewery: string; raw: string};

/** Tier-3 parse: hand the unparseable cells to a runner, get beers per cell. */
export async function parseBatch(
  deps: RunwayDeps,
  items: ParseBatchItem[],
): Promise<Map<string, ParsedBeer[]>> {
  const map = await runBatch(deps, {
    kind: 'parse',
    items,
    itemSchema: parseItemSchema,
    buildPrompt: (inPath, outPath) =>
      `You are normalizing one festival's beer-list submissions into strict JSON.\n\n` +
      `Read the JSON array of items from this file:\n${inPath}\n\n` +
      `Each item is {"key": string, "brewery": string, "raw": string}, where "raw" is a ` +
      `brewer's free-text beer list using ANY delimiter (periods, slashes, pipes, dashes, ` +
      `newlines, parentheses).\n\n` +
      `For EACH item, extract every distinct beer/beverage from "raw" and produce:\n` +
      `{"key": <the item's key>, "beers": [{"name": string, "style": string|null, "abv": number|null, "isNa": boolean}]}\n\n` +
      `Rules:\n` +
      `- Do NOT invent beers, styles, or abv. Unknown style/abv -> null.\n` +
      `- Separate the beer NAME from its STYLE (e.g. "Banana Hammock Hefeweizen" -> name "Banana Hammock", style "Hefeweizen").\n` +
      `- "<0.5" -> abv 0.5 and isNa true. Non-alcoholic / NA / 0.0% / seltzer water -> isNa true.\n` +
      `- If "raw" is "TBD", empty, or a non-beer vendor (jewelry, stickers), output {"key": ..., "beers": []}.\n\n` +
      `Write a single JSON object {"results": [ ...one object per input item... ]} to EXACTLY ` +
      `this path, and nothing else:\n${outPath}\n`,
  });
  return new Map([...map].map(([key, v]) => [key, v.beers]));
}

const enrichItemSchema = z.object({
  key: z.string().min(1),
  style: z.string().nullable().catch(null),
  abv: z.number().nullable().catch(null),
  isNa: z.boolean().catch(false),
  sources: z.array(z.string()).catch([]),
});

export type EnrichBatchItem = {
  key: string;
  brewery: string;
  name: string;
  style: string | null;
  abv: number | null;
};
export type EnrichResult = z.infer<typeof enrichItemSchema>;

/** Tier-3 enrichment: web-look-up missing style/abv for each beer. */
export async function enrichBatch(
  deps: RunwayDeps,
  items: EnrichBatchItem[],
): Promise<Map<string, EnrichResult>> {
  return runBatch(deps, {
    kind: 'enrich',
    items,
    itemSchema: enrichItemSchema,
    buildPrompt: (inPath, outPath) =>
      `You are filling in MISSING beer data for a festival list, using the web.\n\n` +
      `Read the JSON array of items from this file:\n${inPath}\n\n` +
      `Each item is {"key": string, "brewery": string, "name": string, "style": string|null, "abv": number|null}. ` +
      `A null style and/or null abv is what you must try to fill.\n\n` +
      `For EACH item, search the web — the brewery's OWN website first, then Untappd / BeerAdvocate — ` +
      `for that exact beer from that brewery, and produce:\n` +
      `{"key": <key>, "style": string|null, "abv": number|null, "isNa": boolean, "sources": string[]}\n\n` +
      `Rules:\n` +
      `- Only fill a field that was null. NEVER change a value already provided — copy it through.\n` +
      `- If you cannot confirm a value from a real source, leave it null and add nothing to "sources". NEVER guess an ABV.\n` +
      `- "sources" = the URLs you actually used. "isNa" true if it is a non-alcoholic / 0.0% beer.\n\n` +
      `Write a single JSON object {"results": [ ...one object per input item... ]} to EXACTLY ` +
      `this path, and nothing else:\n${outPath}\n`,
  });
}

const BEVERAGE_TYPES = beverageTypeEnum.enumValues as [BeverageType, ...BeverageType[]];

const classifyItemSchema = z.object({
  key: z.string().min(1),
  type: z.enum(BEVERAGE_TYPES),
  isNa: z.boolean().catch(false),
});

export type ClassifyBatchItem = {key: string; style: string};

/** Classify each distinct style name into a beverage type (the LLM fallback for history misses). */
export async function classifyBatch(
  deps: RunwayDeps,
  items: ClassifyBatchItem[],
): Promise<Map<string, Classification>> {
  const map = await runBatch(deps, {
    kind: 'classify',
    items,
    itemSchema: classifyItemSchema,
    buildPrompt: (inPath, outPath) =>
      `You are classifying festival drink styles into a fixed set of beverage types.\n\n` +
      `Read the JSON array of items from this file:\n${inPath}\n\n` +
      `Each item is {"key": string, "style": string}. For EACH item, choose the single best ` +
      `beverage type for that style from EXACTLY this set:\n${BEVERAGE_TYPES.join(', ')}\n\n` +
      `Produce {"key": <the item's key>, "type": <one of the set>, "isNa": boolean}.\n\n` +
      `Rules:\n` +
      `- "hard_tea" = hard/spiked iced teas; "seltzer" = hard seltzers; "cider" = ciders; ` +
      `"mead" = meads; "cocktail" = cocktails, ready-to-drink (RTD) cocktails, and spirits ` +
      `(whiskey, gin, vodka, rum); "wine" = wines.\n` +
      `- Otherwise "beer" — the DEFAULT for all ales, lagers, IPAs, stouts, sours, ` +
      `including barrel-aged beers (a "whiskey barrel-aged stout" is beer, not cocktail).\n` +
      `- "isNa" true ONLY for explicitly non-alcoholic / 0.0% styles.\n\n` +
      `Write a single JSON object {"results": [ ...one object per input item... ]} to EXACTLY ` +
      `this path, and nothing else:\n${outPath}\n`,
  });
  return new Map([...map].map(([key, v]) => [key, {type: v.type, isNa: v.isNa}]));
}
