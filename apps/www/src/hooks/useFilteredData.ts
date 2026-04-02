import {useMemo} from 'react';
import type {BreweryGroup, FilterState} from '../lib/types';

export function useFilteredData(
  breweries: BreweryGroup[] | undefined,
  filters: FilterState,
  tried: Set<string>,
) {
  return useMemo(() => {
    if (!breweries) return [];

    return breweries
      .map((brewery) => {
        const beers = brewery.beers.filter((beer) => {
          const key = `${brewery.name}::${beer.name}`;
          if (filters.showTriedOnly && !tried.has(key)) return false;
          if (filters.naOnly && !beer.isNA) return false;
          if (filters.activeTypes.size > 0 && !filters.activeTypes.has(beer.beverageType)) {
            return false;
          }
          if (filters.search) {
            const q = filters.search.toLowerCase();
            return (
              beer.name.toLowerCase().includes(q) ||
              beer.style.name.toLowerCase().includes(q) ||
              brewery.name.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return {...brewery, beers};
      })
      .filter((b) => b.beers.length > 0);
  }, [breweries, filters, tried]);
}
