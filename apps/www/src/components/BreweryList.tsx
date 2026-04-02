import {type RefObject} from 'react';
import {BreweryHeader} from './BreweryHeader';
import {BeerRow} from './BeerRow';
import type {BreweryGroup} from '../lib/types';

interface BreweryListProps {
  breweries: BreweryGroup[];
  tried: Set<string>;
  onToggleTried: (key: string, beerId: number) => void;
  headerHeight: number;
  breweryRefs: RefObject<Record<string, HTMLDivElement | null>>;
}

export function BreweryList({
  breweries,
  tried,
  onToggleTried,
  headerHeight,
  breweryRefs,
}: BreweryListProps) {
  return (
    <div className="pb-24">
      {breweries.map((brewery) => (
        <div
          key={brewery.name}
          ref={(el) => {
            if (breweryRefs.current) {
              breweryRefs.current[brewery.name] = el;
            }
          }}
        >
          <BreweryHeader
            name={brewery.name}
            beers={brewery.beers}
            stickyTop={headerHeight}
          />
          {brewery.beers.map((beer) => {
            const key = `${brewery.name}::${beer.name}`;
            return (
              <BeerRow
                key={key}
                beer={beer}
                breweryName={brewery.name}
                isTried={tried.has(key)}
                onToggle={() => onToggleTried(key, beer.id)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
