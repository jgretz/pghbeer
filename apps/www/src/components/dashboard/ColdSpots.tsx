import type {ChartTheme} from '../../hooks/useChartTheme';
import type {ColdSpots as ColdSpotsData} from '../../lib/types';

interface Props {
  data: ColdSpotsData;
  theme: ChartTheme;
}

export function ColdSpots({data, theme: t}: Props) {
  if (data.breweries.length === 0) return null;

  return (
    <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
      <div className="font-display text-[13px] font-semibold uppercase tracking-wider text-text-secondary">
        Cold Spots
      </div>
      <div className="-mt-0.5 mb-3 text-[11px] text-text-muted">
        Vendors with lowest engagement
      </div>
      {data.breweries.map(function (vendor, i) {
        return (
          <div
            key={vendor.name}
            className="flex items-center justify-between py-3"
            style={{
              borderBottom:
                i < data.breweries.length - 1 ? `1px solid ${t.border}` : 'none',
            }}
          >
            <div>
              <div className="text-sm font-medium text-text">{vendor.name}</div>
              <div className="mt-0.5 text-[11px] text-text-secondary">
                {vendor.beerCount} beers offered
              </div>
            </div>
            <div
              className="rounded-lg px-2.5 py-1 font-display text-sm font-semibold"
              style={{
                background: `${t.red}18`,
                color: t.red,
              }}
            >
              {vendor.count}
            </div>
          </div>
        );
      })}
      <div className="mt-3.5 rounded-lg bg-surface-alt p-3 text-xs leading-relaxed text-text-secondary">
        Bottom {data.breweries.length} of {data.totalBreweries} vendors. Average vendor
        has {data.avgCheckins} check-ins at this point in the event.
      </div>
    </div>
  );
}
