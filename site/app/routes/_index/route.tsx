import type {V2_MetaFunction} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {useMemo, useState} from 'react';
import type {IndexLoaderData} from '~/Types';
import {EVENT_ID} from '~/constants';
import {loadDataForEvent} from '~/services/loadDataForEvent';
import Header from './header';
import Footer from './footer';
import BreweryList from '~/routes/_index/brewerylist';
import {Search} from './search';
import {Jump} from './jump';
import {Empty} from './empty';
import {applySearchTerm} from '~/services/applySearchTerm';
import {compileJumpNames} from '~/services/compileJumpTerms';

export const meta: V2_MetaFunction = () => {
  return [{title: 'Beers of the Burgh'}];
};

export async function loader() {
  return await loadDataForEvent(EVENT_ID);
}

export default function Index() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // I hate having these functions client side, but I'm up against an event deadline and am still learning remix
  const allListData = useLoaderData<IndexLoaderData>();
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
