import {ProgressBar} from './ProgressBar';
import {FilterSummary} from './FilterSummary';
import type {FilterState} from '../lib/types';
import type {Theme} from '../lib/theme';

interface StickyHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  tried: number;
  total: number;
  filtersVisible: boolean;
  filters: FilterState;
  hasAnyFilter: boolean;
  filteredCount: number;
  onScrollToTop: () => void;
}

export function StickyHeader({
  theme,
  onToggleTheme,
  tried,
  total,
  filtersVisible,
  filters,
  hasAnyFilter,
  filteredCount,
  onScrollToTop,
}: StickyHeaderProps) {
  return (
    <div className="sticky top-0 z-[100] border-b border-border bg-surface transition-colors">
      <div className="flex items-center justify-between px-4 pb-2 pt-2.5">
        <img
          src="/assets/botb-logo.jpg"
          alt="Beers of the Burgh"
          className="h-[38px] object-contain"
        />
        <button
          onClick={onToggleTheme}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-[1.5px] border-border bg-bg text-lg transition-all"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}'}
        </button>
      </div>

      <ProgressBar tried={tried} total={total} />

      {!filtersVisible && (
        <FilterSummary
          filters={filters}
          hasAnyFilter={hasAnyFilter}
          filteredCount={filteredCount}
          onScrollToTop={onScrollToTop}
        />
      )}
    </div>
  );
}
