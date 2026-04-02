import {useQuery} from '@tanstack/react-query';
import {fetchEventData} from '../lib/api';
import type {EventDataResponse} from '../lib/api';
import {EVENT_ID} from '../lib/constants';
import type {EventBeerItem, BreweryGroup, EventInfo} from '../lib/types';

function groupByBrewery(items: EventBeerItem[]): BreweryGroup[] {
  const map = new Map<string, BreweryGroup>();

  for (const item of items) {
    const name = item.beer.brewery.name;
    const group = map.get(name);
    if (group) {
      group.beers.push(item.beer);
    } else {
      map.set(name, {name, beers: [item.beer]});
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function selectGrouped(data: EventDataResponse): {event: EventInfo; breweries: BreweryGroup[]} {
  return {
    event: data.event,
    breweries: groupByBrewery(data.beers),
  };
}

export function useEventData() {
  return useQuery({
    queryKey: ['eventData', EVENT_ID],
    queryFn: fetchEventData,
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    networkMode: 'offlineFirst',
    select: selectGrouped,
  });
}
