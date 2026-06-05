# 2026 Festival Import Plan

Design for sourcing the 2026 beer list directly from the festival-form Google
Sheet instead of hand-curating JSON. **Plan only** — no importer, DB writes, or
edits to `scripts/import.ts` are part of this work.

## Context

Each year's list is loaded from hand-curated JSON under
`scripts/data/<year>/loadN.json` (shape `{ brewery, name, style, abv }`, e.g.
`scripts/data/2025/load1.json`) via `scripts/import.ts`. That script:

- defines the target shape `LoadData` (`scripts/import.ts:4-9`);
- reads env `EVENT_ID` / `DATA_FILE` (`scripts/import.ts:14-15`);
- find-or-creates breweries, styles, beers
  (`findOrCreateBrewery/Style/Beer`, `scripts/import.ts:19-81`);
- links each beer to an event through `eventbeerlist`
  (`ensureBeerAtEvent`, `scripts/import.ts:83-98`);
- drives the loop reading one `DATA_FILE` (`main`, `scripts/import.ts:100-123`).

For 2026 we already have a read-only `google-sheets` package and a working
access script. The festival form collects submissions per brewery, so the
sheet can replace the manual JSON step. The source sheet is spreadsheetId
`1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w`, beer-list tab gid `550756003`
(`scripts/test-sheet-access.ts:3-4`). The `google-sheets` public API to consume
is `readSheetValues`, `listSheetTitles`, `getAccessToken`, `loadGoogleAuthConfig`
(`packages/google-sheets/src/index.ts`); `readSheetValues` returns `string[][]`
(`packages/google-sheets/src/read-sheet-values.ts:9-21`), so **every cell is a
string** and ABV must be parsed.

## Column → `LoadData` mapping

One submission row per brewery. Exact column letters are **TBD** — the live
sheet cannot be read while authoring this doc, so an operator must confirm them
(see open questions). Expected semantics:

| `LoadData` field | Source | Notes |
| --- | --- | --- |
| `brewery` | Brewery-name column (TBD) | One value per submission row; applies to every beer parsed from that row. |
| `name` | Primary beer-list column (TBD), plus extras in **M and N** | Primary column may hold one beer per row, or multiple beers per row depending on the form layout — confirm. |
| `style` | Per-beer style column (TBD) | May be a sibling column on the same row; M/N beers often omit it (see below). |
| `abv` | Per-beer ABV column (TBD) | String in the sheet → parse to number. M/N beers often omit it. |

If the primary column packs multiple beers/styles/abvs into one cell, the
adapter splits them; if the form uses one column-set per beer, the adapter maps
each set. The operator confirms which layout 2026 uses before implementation.

## M/N-column handling

Some brewers entered **extra beers in columns M and N**, outside the normal
beer-list column. Rules:

- **Per-brewery association**: M and N belong to the same submission row, so
  their beers inherit that row's `brewery`. Never associate M/N across rows.
- **Detection**: treat an M or N cell as a beer when it is non-blank after
  trimming whitespace.
- **De-duplication vs. the primary column**: drop an M/N beer whose `name`
  matches a primary-column beer for the **same brewery**, compared
  case-insensitively on the trimmed name. This mirrors the importer's own
  beer-identity dedup on `(name, breweryId, styleId)` (`scripts/import.ts:63-69`).
- **Style/ABV disambiguation**: M/N cells usually carry only a name. Resolve
  missing fields in order:
  1. fall back to a sibling style/abv column on the same row if present;
  2. otherwise use a sentinel style `"Unknown"` and `abv` of `0`;
  3. in all sentinel cases, log a warning and flag the row for operator review
     so the values can be corrected before import.

## Normalization & validation

- **Trim** every cell before use.
- **ABV parser** (string → number): strip a trailing `%`; for ranges like
  `5-6` or `5.5-6.0%` take the low end; blank or non-numeric → `0` with a
  logged warning (do not silently drop the beer for a bad ABV).
- **Skip rows** with a blank `brewery` or blank `name` after trim; log each
  skip.
- **Dedup is delegated downstream**: brewery/style dedup against existing DB
  rows is handled by the importer's find-or-create (`scripts/import.ts:19-55`),
  and beer identity by `(name, breweryId, styleId)` (`scripts/import.ts:63-69`).
  The adapter only needs to dedup M/N against the primary column within a row.

## Import path

Recommend a **new `scripts/import-from-sheet.ts` thin adapter** rather than
editing `scripts/import.ts`:

1. read the beer-list tab via `readSheetValues` (gid→title resolution as in
   `scripts/test-sheet-access.ts:17-38`);
2. transform rows → `LoadData[]` applying the rules above;
3. **write `scripts/data/2026/load.json`** — a committable, inspectable
   artifact;
4. run the existing `bun run import` with `EVENT_ID=<2026 id>` and
   `DATA_FILE=./scripts/data/2026/load.json`.

The generated-JSON path (a) is preferred over (b) importing the find-or-create
helpers directly, because it keeps the proven upsert/link path untouched,
produces a diff-able artifact, and is re-runnable. Path (b) would require
exporting the currently file-private helpers from `scripts/import.ts` — a change
this design deliberately avoids.

**`EVENT_ID` selection**: 2025 used `EVENT_ID=7` (`scripts/import.ts:14`). For
2026 it is the `id` of the 2026 row in the `events` table
(`packages/database/schema/event.schema.ts`); the operator confirms it.

**Idempotency / re-runnable**: regenerating the JSON and re-running `bun run
import` is a no-op for already-imported data — find-or-create returns existing
brewery/style/beer rows, and `ensureBeerAtEvent` skips when an
`eventbeerlist` row already exists (`scripts/import.ts:83-98`).

> Beverage-type classification (`scripts/backfill-beverage-type.ts:60-72`,
> `classifyStyle`) is a **separate downstream step**, not part of this import
> path — listed only for context.

## Implementation checklist

1. Add `scripts/import-from-sheet.ts`; declare `google-sheets` as a root
   `package.json` dependency if not already present (workspace resolution).
2. Resolve the beer-list tab title from gid `550756003` and read its values.
3. Implement the ABV parser and trim/validation rules.
4. Implement primary-column parsing and M/N extra-beer parsing with per-row
   dedup and style/abv fallback + review flagging.
5. Emit `scripts/data/2026/load.json` and log skip/sentinel warnings.
6. Run `EVENT_ID=<2026> DATA_FILE=./scripts/data/2026/load.json bun run import`.
7. Spot-check the generated JSON and the imported event before announcing.

## Operator open questions

- What is the 2026 `EVENT_ID` (the 2026 `events.id`)?
- What are the **exact column letters** for brewery, primary beer-list, style,
  and ABV — and is M/N still where extra beers land in the 2026 form?
- Is there a header row to skip, and at what row index does data start?
- Is the beer-list tab still gid `550756003` for 2026, or a new tab?
- Does the primary beer column hold one beer per row or multiple per cell?
