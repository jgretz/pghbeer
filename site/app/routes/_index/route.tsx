import type {V2_MetaFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import type {Beer} from '~/Types';
import {EVENT_ID} from '~/constants';
import BreweryList from '~/components/brewerylist';
import {loadDataForEvent} from '~/services/loadDataForEvent';
import Header from './header';
// import Footer from './footer';

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
    <div className="relative font-sans text-black">
      <Header />
      <BreweryList breweries={data.breweries} data={data.data} />
      {/* <Footer /> */}
    </div>
  );
}
