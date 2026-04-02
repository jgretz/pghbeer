import type {FilterState, BeverageType} from '../lib/types';
import {BEVERAGE_LABELS} from '../lib/constants';

interface FilterSummaryProps {
  filters: FilterState;
  hasAnyFilter: boolean;
  filteredCount: number;
  onScrollToTop: () => void;
}

function buildSummary(filters: FilterState): string | null {
  const parts: string[] = [];
  if (filters.search) parts.push(`"${filters.search}"`);
  if (filters.activeTypes.size > 0) {
    const labels = Array.from(filters.activeTypes).map(
      (t: BeverageType) => BEVERAGE_LABELS[t] ?? t,
    );
    parts.push(labels.join(', '));
  }
  if (filters.naOnly) parts.push('NA only');
  if (filters.showTriedOnly) parts.push('Tried only');
  return parts.length > 0 ? parts.join('  \u00B7  ') : null;
}

export function FilterSummary({
  filters,
  hasAnyFilter,
  filteredCount,
  onScrollToTop,
}: FilterSummaryProps) {
  const summary = buildSummary(filters);

  return (
    <button
      onClick={onScrollToTop}
      className={`flex w-full items-center gap-2 border-t border-border-light px-4 py-2.5 transition-colors ${
        hasAnyFilter ? 'bg-gold-bg' : 'bg-surface'
      }`}
    >
      <span className="text-[13px] text-text-muted">{'\u{1F50D}'}</span>
      {summary ? (
        <span className="flex-1 truncate text-left text-[13px] font-semibold text-gold-dark">
          {summary}
        </span>
      ) : (
        <span className="flex-1 text-left text-[13px] text-text-muted">
          Search &amp; filter
        </span>
      )}
      <span className="shrink-0 text-xs text-text-secondary">{filteredCount} shown</span>
      <span className="text-[11px] text-text-muted">{'\u25B2'}</span>
    </button>
  );
}
