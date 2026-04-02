import {createFileRoute} from '@tanstack/react-router';
import {useTheme} from '../hooks/useTheme';
import {useDashboardStats} from '../hooks/useDashboardStats';
import {useEventData} from '../hooks/useEventData';
import {useChartTheme} from '../hooks/useChartTheme';
import {KpiCards} from '../components/dashboard/KpiCards';
import {VelocityChart} from '../components/dashboard/VelocityChart';
import {TopBeers} from '../components/dashboard/TopBeers';
import {TopBreweries} from '../components/dashboard/TopBreweries';
import {TypeDonut} from '../components/dashboard/TypeDonut';
import {StyleTrends} from '../components/dashboard/StyleTrends';
import {BeersPerPersonChart} from '../components/dashboard/BeersPerPersonChart';
import {ColdSpots} from '../components/dashboard/ColdSpots';
import {LiveIndicator} from '../components/dashboard/LiveIndicator';

export const Route = createFileRoute('/stats')({
  head: () => ({
    meta: [{title: 'PghBeer — Live Stats'}],
  }),
  component: StatsPage,
});

function StatsPage() {
  const {theme, toggle: toggleTheme} = useTheme();
  const {data, isLoading, isError} = useDashboardStats();
  const {data: eventData} = useEventData();
  const chartTheme = useChartTheme();

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center text-text-secondary">
          <div className="mb-2 font-display text-lg font-bold text-gold">PghBeer</div>
          Loading stats...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center text-text-secondary">
          <div className="mb-2 font-display text-lg font-bold text-gold">PghBeer</div>
          Failed to load stats
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors">
      {/* Pulse animation for live indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Sticky header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-surface px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-display text-base font-bold uppercase tracking-wide text-gold">
              Live Stats
            </div>
            <div className="text-[11px] text-text-secondary">
              {eventData?.event.name ?? 'Beers of the Burgh'}{' '}
              {eventData?.event.date ? new Date(eventData.event.date).getFullYear() : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator generatedAt={data.generatedAt} isError={isError} />
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-alt text-base"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 p-5">
        <KpiCards data={data} />
        <VelocityChart data={data.velocity} theme={chartTheme} />

        <div className="grid grid-cols-1 gap-3.5 min-[720px]:grid-cols-2">
          <TopBeers data={data.topBeers} theme={chartTheme} />
          <TopBreweries data={data.topBreweries} theme={chartTheme} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 min-[720px]:grid-cols-2">
          <TypeDonut data={data.byType} theme={chartTheme} />
          <StyleTrends data={data.styleTrends} theme={chartTheme} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 min-[720px]:grid-cols-2">
          <BeersPerPersonChart
            data={data.beersPerPerson}
            uniqueUsers={data.uniqueUsers}
            theme={chartTheme}
          />
          <ColdSpots data={data.coldSpots} theme={chartTheme} />
        </div>
      </div>
    </div>
  );
}
