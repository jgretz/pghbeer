import type {V2_MetaFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import type {Beer} from '~/Types';
import {loadDataForEvent} from '~/services';
import {EVENT_ID} from '~/constants';
import BreweryList from '~/components/brewerylist';

type LoaderData = {
  breweries: string[];
  data: Record<string, Beer[]>;
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Beers of the Burgh'}];
};

export async function loader() {
  return await loadDataForEvent(EVENT_ID);
}

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <BreweryList breweries={data.breweries} data={data.data} />
    </>
  );
}
