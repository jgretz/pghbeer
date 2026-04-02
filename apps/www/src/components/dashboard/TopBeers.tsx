import type {ChartTheme} from '../../hooks/useChartTheme';
import type {TopBeer} from '../../lib/types';

interface Props {
  data: TopBeer[];
  theme: ChartTheme;
}

function TrendArrow({value, theme: t}: {value: number; theme: ChartTheme}) {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <span
      className="ml-1.5 text-[11px] font-bold"
      style={{color: up ? t.naGreen : t.red}}
    >
      {up ? '▲' : '▼'} {Math.abs(value)}
    </span>
  );
}

export function TopBeers({data, theme: t}: Props) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Top Beers
      </div>
      <div className="-mt-0.5 mb-2 text-[11px] text-text-muted">
        ▲▼ = change in last 30 min
      </div>
      {data.map(function (beer, i) {
        const trend = beer.recentCount;
        return (
          <div
            key={beer.name}
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
              <div className="truncate text-sm font-medium text-text">{beer.name}</div>
              <div className="mt-0.5 text-[11px] text-text-secondary">
                {beer.breweryName}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center">
              <span className="font-display text-base font-semibold text-text">
                {beer.count}
              </span>
              <TrendArrow value={trend} theme={t} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
