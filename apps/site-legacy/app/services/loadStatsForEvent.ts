import * as R from 'ramda';
import type {StatItemData, StatsCountListItem} from '~/Types';
import {STATS_URL} from '~/constants';

function compareStatsCountListItem(a: StatsCountListItem, b: StatsCountListItem) {
  return a.count > b.count ? -1 : a.count === b.count ? 0 : 1;
}

function compileStylesByCountList(data: StatItemData[]) {
  return R.collectBy(function (x) {
    return x.beer.style.name;
  }, data)
    .map(function ([stat, ...others]) {
      return {
        name: stat.beer.style.name,
        count: others.length + 1,
      };
    })
    .sort(compareStatsCountListItem);
}

function compileBreweriesByCountList(data: StatItemData[]) {
  return R.collectBy(function (x) {
    return x.beer.brewery.id;
  }, data)
    .map(function ([stat, ...others]) {
      return {
        name: stat.beer.brewery.name,
        count: others.length + 1,
      };
    })
    .sort(compareStatsCountListItem);
}

function compileBeersByCountList(data: StatItemData[]) {
  return R.collectBy(function (x) {
    return x.beer.id;
  }, data)
    .map(function ([stat, ...others]) {
      return {
        name: stat.beer.name,
        count: others.length + 1,
      };
    })
    .sort(compareStatsCountListItem);
}

function compileTopLineStats(data: StatItemData[]) {
  return {
    totalUsers: R.uniqBy(function (x) {
      return x.user_id;
    }, data).length,
    totalUniqueBeersDrank: R.uniqBy(function (x) {
      return x.beer.id;
    }, data).length,
    totalBeersDrank: data.length,
  };
}

export async function loadStatsForEvent(eventId: number) {
  const url = `${STATS_URL}?event_id=${eventId}`;
  const res = await fetch(url);
  const data: StatItemData[] = await res.json();

  return {
    topLineStats: compileTopLineStats(data),
    beers: compileBeersByCountList(data),
    breweries: compileBreweriesByCountList(data),
    styles: compileStylesByCountList(data),
  };
}
