import type {LoaderArgs, V2_MetaFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import * as R from 'ramda';
import type {Beer} from '~/Types';
import {EVENT_ID} from '~/constants';
import {loadDataForEvent} from '~/services/loadDataForEvent';
import Header from './header';
import Footer from './footer';
import BreweryList from '~/routes/_index/brewerylist';
import {Search} from './search';
import {useMemo, useState} from 'react';
import {Jump} from './jump';
import {Empty} from './empty';

type LoaderData = {
  breweries: string[];
  data: Record<string, Beer[]>;
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Beers of the Burgh'}];
};

export async function loader({request}: LoaderArgs) {
  return await loadDataForEvent(EVENT_ID);
}

// I hate having these functions here, but I'm up against an event deadline and am still learning remix
function applySearchTerm(searchTerm: string, listData: LoaderData): LoaderData {
  const term = searchTerm.toUpperCase();

  const data = listData.breweries.reduce((acc, brewery) => {
    const beers = listData.data[brewery].filter(
      (beer) =>
        beer.brewery.name.toUpperCase().includes(term) ||
        beer.name.toUpperCase().includes(term) ||
        beer.style.name.toUpperCase().includes(term),
    );

    if (beers.length > 0) {
      acc[brewery] = beers;
    }

    return acc;
  }, {} as Record<string, Beer[]>);

  return {
    breweries: Object.keys(data),
    data,
  };
}

function compileJumpNames(breweries: string[]) {
  return R.uniq(breweries.map((b) => b.substring(0, 1)));
}

// UI
export default function Index() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allListData = useLoaderData<LoaderData>();
  const listData = useMemo(() => {
    return applySearchTerm(searchTerm, allListData);
  }, [allListData, searchTerm]);

  const jumpNames = useMemo(() => {
    return compileJumpNames(listData.breweries);
  }, [listData]);

  const hasData = listData.breweries.length > 0;

  return (
    <div className="relative font-sans text-black">
      <Header />
      {hasData && <BreweryList breweries={listData.breweries} data={listData.data} />}
      {!hasData && <Empty searchTerm={searchTerm} />}
      <Footer showSearch={setSearchModalVisible} showJump={setJumpModalVisible} />

      <Jump isVisible={jumpModalVisible} setIsVisible={setJumpModalVisible} names={jumpNames} />

      <Search
        isVisible={searchModalVisible}
        setIsVisible={setSearchModalVisible}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
}
