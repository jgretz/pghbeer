import type {LoaderArgs, V2_MetaFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import type {StatsLoaderData} from '~/Types';
import {loadStatsForEvent} from '~/services/loadStatsForEvent';
import {StatsList} from './statslist';
import {EVENT_ID} from '~/constants';

export const meta: V2_MetaFunction = () => {
  return [{title: 'Beers of the Burgh - Stats'}];
};

export async function loader({request}: LoaderArgs) {
  return await loadStatsForEvent(EVENT_ID);
}

export default function Stats() {
  const stats = useLoaderData<StatsLoaderData>();

  return (
    <div className="container m-5">
      <div>
        <h1 className="text-3xl">Headline</h1>
        <div className="ml-5 mr-12 grid grid-cols-3">
          <div className="col-span-2">Total Users:</div>
          <div className="text-right">{stats.topLineStats.totalUsers}</div>
          <div className="col-span-2">Total Beers Drank:</div>
          <div className="text-right">{stats.topLineStats.totalBeersDrank}</div>
          <div className="col-span-2">Total Unique Beers Drank:</div>
          <div className="text-right">{stats.topLineStats.totalUniqueBeersDrank}</div>
        </div>
      </div>

      <StatsList title="Beers" data={stats.beers} />
      <StatsList title="Breweries" data={stats.breweries} />
      <StatsList title="Styles" data={stats.styles} />
    </div>
  );
}
