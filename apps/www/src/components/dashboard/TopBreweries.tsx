import type {ChartTheme} from '../../hooks/useChartTheme';
import type {TopBrewery} from '../../lib/types';

interface Props {
  data: TopBrewery[];
  theme: ChartTheme;
}

export function TopBreweries({data, theme: t}: Props) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Top Breweries
      </div>
      <div className="-mt-0.5 mb-2 text-[11px] text-text-muted">
        Total check-ins across all beers
      </div>
      {data.map(function (brewery, i) {
        return (
          <div
            key={brewery.name}
            className="flex items-center gap-3 py-2.5"
            style={{
              borderBottom:
                i < data.length - 1 ? `1px solid ${t.border}` : 'none',
            }}
          >
            <span
              className="w-7 flex-shrink-0 text-center font-display text-base font-bold"
              style={{color: i < 3 ? t.gold : t.textMuted}}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text">{brewery.name}</div>
              <div className="mt-0.5 text-[11px] text-text-secondary">
                {brewery.beerCount} beers
              </div>
            </div>
            <span className="flex-shrink-0 font-display text-base font-semibold text-text">
              {brewery.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
