import {createFileRoute, Link} from '@tanstack/react-router';
import {Moon, RotateCw, Sun, X} from 'lucide-react';
import {FestivalMap} from '../components/map/FestivalMap';
import {useTheme} from '../hooks/useTheme';
import {useEventMap} from '../hooks/useEventMap';
import {useOrientation} from '../hooks/useOrientation';
import {useDismissibleFlag} from '../hooks/useDismissibleFlag';
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

// Wide maps are cramped in portrait. Rather than rotating the SVG, the map
// renders naturally (upright labels) and fills the screen in landscape. In
// portrait a non-blocking banner suggests turning the phone — the wrapper is
// pointer-events-none so panning/zooming the map underneath still works; only
// the pill itself is interactive.
function RotateNudge({onDismiss}: {onDismiss: () => void}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-3 pr-2 shadow-[0_4px_16px_var(--color-shadow)]">
        <RotateCw className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        <span className="text-sm text-text">
          Rotate your phone — the map reads best in landscape.
        </span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-secondary"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function MapPage() {
  const {theme, toggle: toggleTheme} = useTheme();
  const {brewery} = Route.useSearch();
  const {data, isLoading, isError} = useEventMap();
  const orientation = useOrientation();
  const {dismissed: nudgeDismissed, dismiss: dismissNudge} =
    useDismissibleFlag('map-rotate-nudge');

  const visible = isMapVisible(data?.enabled);
  const portrait = orientation === 'portrait';
  const showNudge = portrait && !nudgeDismissed;

  return (
    <div
      className={`mx-auto flex h-[100dvh] flex-col bg-bg text-text ${
        portrait ? 'max-w-[600px]' : 'max-w-none'
      }`}
    >
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
          {theme === 'dark' ? (
            <Sun size={20} className="text-text" aria-hidden="true" />
          ) : (
            <Moon size={20} className="text-text" aria-hidden="true" />
          )}
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
        <div className="relative flex flex-1 flex-col">
          <FestivalMap layout={data.activeLayout} highlightBreweryId={brewery} />
          {showNudge && <RotateNudge onDismiss={dismissNudge} />}
        </div>
      )}
    </div>
  );
}
