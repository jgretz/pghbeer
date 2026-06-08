import {
  buildHistory,
  loadStyleSeed,
  matchStyle,
  normalizeStyle,
  type Classification,
} from './classify.ts';
import {classifyBatch, safeBatch, type RunwayDeps} from './runway-batch.ts';
import type {Plan} from './plan.ts';
import type {Ledger} from './state.ts';

const DEFAULT: Classification = {type: 'beer', isNa: false};

/**
 * Resolve a beverage type for every distinct style in the plan: history match
 * first (seed + ledger cache), then one LLM classify batch for the misses, whose
 * answers are cached back into the ledger. Returns a `normalizeStyle → Classification`
 * map for {@link persist} to read.
 */
export async function resolveClassification(
  plan: Plan,
  ledger: Ledger,
  runway: RunwayDeps,
): Promise<Map<string, Classification>> {
  const seed = await loadStyleSeed();
  const history = buildHistory(seed.exact, ledger.classification);

  const resolved = new Map<string, Classification>();
  const misses = new Map<string, string>(); // normalized style → an original spelling (for the prompt)

  for (const style of collectStyles(plan)) {
    const norm = normalizeStyle(style);
    if (resolved.has(norm) || misses.has(norm)) continue;
    const match = matchStyle(style, history, seed.keywords);
    if (match) resolved.set(norm, match);
    else misses.set(norm, style);
  }

  if (misses.size === 0) return resolved;

  console.log(`Runway classify batch: ${misses.size} style(s)`);
  const items = [...misses].map(([key, style]) => ({key, style}));
  const {results} = await safeBatch(() => classifyBatch(runway, items), 'classify');

  for (const [norm] of misses) {
    const res = results.get(norm);
    resolved.set(norm, res ?? DEFAULT); // miss/failure → default beer
    if (res)
      ledger.classification[norm] = {type: res.type, isNa: res.isNa, at: new Date().toISOString()};
  }
  return resolved;
}

/** Every distinct non-null style across fresh + cached rows. */
function collectStyles(plan: Plan): string[] {
  const out = new Set<string>();
  for (const f of plan.fresh) for (const b of f.beers) if (b.style) out.add(b.style);
  for (const c of plan.cached) for (const b of c.beers) if (b.style) out.add(b.style);
  return [...out];
}
