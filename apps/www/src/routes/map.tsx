import {createFileRoute, Link} from '@tanstack/react-router';
import {FestivalMap} from '../components/map/FestivalMap';
import {useTheme} from '../hooks/useTheme';
import {useEventMap} from '../hooks/useEventMap';
import {isMapVisible} from '../lib/mapFlag';

interface MapSearch {
  brewery?: number;
}

export const Route = createFileRoute('/map')({
  head: () => ({
    meta: [{title: 'PghBeer — Festival Map'}],
  }),
  validateSearch: (search: Record<string, unknown>): MapSearch => {
    const b = Number(search.brewery);
    return Number.isFinite(b) && b > 0 ? {brewery: b} : {};
  },
  component: MapPage,
});

function CenteredMessage({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center text-text-secondary">
      <div>
        <div className="mb-2 font-display text-lg font-bold text-gold">PghBeer</div>
        {children}
      </div>
    </div>
  );
}

function MapPage() {
  const {theme, toggle: toggleTheme} = useTheme();
  const {brewery} = Route.useSearch();
  const {data, isLoading, isError} = useEventMap();

  const visible = isMapVisible(data?.enabled);

  return (
    <div className="mx-auto flex h-[100dvh] max-w-[600px] flex-col bg-bg text-text">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
        <Link
          to="/"
          className="flex h-[42px] items-center gap-1 rounded-xl border-[1.5px] border-border bg-bg px-3 text-sm font-semibold text-text"
        >
          ← Back
        </Link>
        <span className="font-display text-sm font-bold uppercase tracking-wide text-text dark:text-gold">
          Festival Map
        </span>
        <button
          onClick={toggleTheme}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border-[1.5px] border-border bg-bg text-lg"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '\u{1F319}'}
        </button>
      </div>

      {isLoading && !data ? (
        <CenteredMessage>Loading map…</CenteredMessage>
      ) : isError && !data ? (
        <CenteredMessage>
          Couldn't load the map — check your connection and try again.
        </CenteredMessage>
      ) : !visible ? (
        <CenteredMessage>The festival map isn't available yet.</CenteredMessage>
      ) : !data?.activeLayout ? (
        <CenteredMessage>The map hasn't been set up for this event yet.</CenteredMessage>
      ) : (
        <FestivalMap layout={data.activeLayout} highlightBreweryId={brewery} />
      )}
    </div>
  );
}
