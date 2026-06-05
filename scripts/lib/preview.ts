import type {Plan} from './plan.ts';

/** Print what the deterministic pass found and what would hit runway — no side effects. */
export function preview(plan: Plan): void {
  console.log('\n[dry-run] no DB writes, no runway, no state changes\n');
  for (const f of plan.fresh) {
    console.log(`${f.row.brewery}: ${f.beers.length} beer(s) parsed deterministically`);
    for (const b of f.beers) {
      console.log(
        `    - ${b.name} | ${b.style ?? '(style?)'} | ${b.abv ?? '(abv?)'}${b.isNa ? ' | NA' : ''}`,
      );
    }
  }

  const pendingCells = plan.fresh.reduce((n, f) => n + f.pending.length, 0);
  const missing = plan.fresh
    .flatMap((f) => f.beers)
    .filter((b) => b.style === null || b.abv === null).length;
  console.log(`\n${plan.cached.length} cached row(s) unchanged.`);
  console.log(`${pendingCells} cell(s) would go to the runway parse batch.`);
  console.log(`~${missing} parsed beer(s) missing style/abv would be web-enriched.`);
}
