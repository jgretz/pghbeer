import {forwardRef} from 'react';
import {Link} from '@tanstack/react-router';
import {ProgressBar} from './ProgressBar';
import {FilterSummary} from './FilterSummary';
import type {FilterState} from '../lib/types';
import type {Theme} from '../lib/theme';

interface StickyHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  mapVisible: boolean;
  eventDate?: string;
  tried: number;
  total: number;
  filtersVisible: boolean;
  filters: FilterState;
  hasAnyFilter: boolean;
  filteredCount: number;
  onScrollToTop: () => void;
}

function formatEventDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
}

export const StickyHeader = forwardRef<HTMLDivElement, StickyHeaderProps>(function StickyHeader({
  theme,
  onToggleTheme,
  mapVisible,
  eventDate,
  tried,
  total,
  filtersVisible,
  filters,
  hasAnyFilter,
  filteredCount,
  onScrollToTop,
}, ref) {
  return (
    <div ref={ref} className="sticky top-0 z-[100] border-b border-border bg-surface transition-colors">
      <div className="flex items-center justify-between px-4 pb-2 pt-2.5">
        <img
          src="/assets/botb-logo.jpg"
          alt="Beers of the Burgh"
          className="h-[38px] rounded-full object-contain"
        />
        <div className="flex flex-col items-center">
          <span className="font-display text-sm font-bold leading-tight text-text">Beers of the Burgh</span>
          {eventDate && (
            <span className="text-[11px] leading-tight text-text-secondary">{formatEventDate(eventDate)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mapVisible && (
            <Link
              to="/map"
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-[1.5px] border-border bg-bg text-lg transition-all"
              aria-label="Festival map"
            >
              {'\u{1F5FA}\uFE0F'}
            </Link>
          )}
          <button
            onClick={onToggleTheme}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-[1.5px] border-border bg-bg text-lg transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}'}
          </button>
        </div>
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
});
