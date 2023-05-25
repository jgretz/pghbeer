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

const sortBeersByName = function (a: Beer, b: Beer) {
  return a.name.localeCompare(b.name);
};

const sortBreweriesAndBeers = function (data: Record<string, Beer[]>) {
  const keys = Object.keys(data);
  const sortedData: Record<string, Beer[]> = keys.reduce(function (record, key) {
    record[key] = R.sort(sortBeersByName, data[key]);

    return record;
  }, {} as Record<string, Beer[]>);

  return {
    breweries: R.sort(sortBreweriesByName, keys),
    data: sortedData,
  };
};

const prepare = R.pipe(projectBeers, groupBeersByBrewery, sortBreweriesAndBeers);

export async function loadDataForEvent(eventId: number) {
  const url = `${DATA_URL}${eventId}`;
  const res = await fetch(url);
  const data: Data[] = await res.json();

  return prepare(data);
}
