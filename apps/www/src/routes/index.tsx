import {useState, useRef, useCallback, useMemo} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {StickyHeader} from '../components/StickyHeader';
import {FilterControls} from '../components/FilterControls';
import {BreweryList} from '../components/BreweryList';
import {EmptyState} from '../components/EmptyState';
import {JumpFab} from '../components/JumpFab';
import {JumpSheet} from '../components/JumpSheet';
import {useTheme} from '../hooks/useTheme';
import {useEventData} from '../hooks/useEventData';
import {useTriedSet} from '../hooks/useTriedSet';
import {useFilterState} from '../hooks/useFilterState';
import {useFilteredData} from '../hooks/useFilteredData';
import {useFiltersVisible} from '../hooks/useFiltersVisible';
import type {BeverageType} from '../lib/types';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{title: 'PghBeer — Beers of the Burgh 2026'}],
  }),
  component: IndexPage,
});

function IndexPage() {
  const {theme, toggle: toggleTheme} = useTheme();
  const {data, isLoading} = useEventData();
  const breweries = data?.breweries;
  const eventInfo = data?.event;
  const {tried, toggle: toggleTried} = useTriedSet();
  const [jumpOpen, setJumpOpen] = useState(false);

  const filterSentinelRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const breweryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const filtersVisible = useFiltersVisible(filterSentinelRef);

  // Derive available types from data
  const availableTypes = useMemo<BeverageType[]>(() => {
    if (!breweries) return [];
    const types = new Set<BeverageType>();
    for (const b of breweries) {
      for (const beer of b.beers) {
        types.add(beer.beverageType);
      }
    }
    return Array.from(types).sort();
  }, [breweries]);

  const totalBeers = useMemo(
    () => (breweries ?? []).reduce((sum, b) => sum + b.beers.length, 0),
    [breweries],
  );

  const {
    state: filters,
    hasAnyFilter,
    setSearch,
    clearSearch,
    toggleType,
    clearTypes,
    toggleNA,
    toggleTried: toggleTriedFilter,
  } = useFilterState(availableTypes.length);

  const filtered = useFilteredData(breweries, filters, tried);

  const filteredBeerCount = useMemo(
    () => filtered.reduce((sum, b) => sum + b.beers.length, 0),
    [filtered],
  );

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);

  const scrollToBrewery = useCallback(
    (letter: string) => {
      const target = filtered.find((b) => b.name[0].toUpperCase() === letter);
      if (target && breweryRefs.current[target.name]) {
        breweryRefs.current[target.name]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
      setJumpOpen(false);
    },
    [filtered],
  );

  if (isLoading && !breweries) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[600px] items-center justify-center bg-bg">
        <div className="text-center text-text-secondary">
          <div className="mb-2 font-display text-lg font-bold text-gold">PghBeer</div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[600px] bg-bg text-text transition-colors">
      <div ref={topRef} />

      <StickyHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        eventDate={eventInfo?.date}
        tried={tried.size}
        total={totalBeers}
        filtersVisible={filtersVisible}
        filters={filters}
        hasAnyFilter={hasAnyFilter}
        filteredCount={filteredBeerCount}
        onScrollToTop={scrollToTop}
      />

      <FilterControls
        search={filters.search}
        onSearchChange={setSearch}
        onSearchClear={clearSearch}
        activeTypes={filters.activeTypes}
        availableTypes={availableTypes}
        onToggleType={toggleType}
        onClearTypes={clearTypes}
        naOnly={filters.naOnly}
        onToggleNA={toggleNA}
        showTriedOnly={filters.showTriedOnly}
        onToggleTried={toggleTriedFilter}
      />

      <div ref={filterSentinelRef} className="h-px" />

      {filtered.length === 0 ? (
        <EmptyState showTriedOnly={filters.showTriedOnly} triedCount={tried.size} />
      ) : (
        <BreweryList
          breweries={filtered}
          tried={tried}
          onToggleTried={toggleTried}
          filtersVisible={filtersVisible}
          breweryRefs={breweryRefs}
        />
      )}

      <JumpFab onClick={() => setJumpOpen(true)} />

      {jumpOpen && (
        <JumpSheet
          breweries={filtered}
          onSelect={scrollToBrewery}
          onClose={() => setJumpOpen(false)}
        />
      )}
    </div>
  );
}
