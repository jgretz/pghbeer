import * as R from 'ramda';
import type {Beer, Data} from '~/Types';
import {DATA_URL} from '~/constants';

const projectBeers = function (data: Data[]) {
  return data.map((d) => d.beer);
};

const groupBeersByBrewery = R.groupBy(function (beer: Beer) {
  return beer.brewery.name;
});

const sortBreweriesByName = function (a: string, b: string) {
  return a.localeCompare(b);
};

const addSortedBreweries = function (data: Record<string, Beer[]>) {
  const keys = Object.keys(data);

  return {
    breweries: R.sort(sortBreweriesByName, keys),
    data,
  };
};

const prepare = R.pipe(projectBeers, groupBeersByBrewery, addSortedBreweries);

export async function loadDataForEvent(eventId: number) {
  const url = `${DATA_URL}${eventId}`;
  const res = await fetch(url);
  const data: Data[] = await res.json();

  return prepare(data);
}
