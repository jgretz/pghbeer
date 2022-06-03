import React from 'react';
import {useSelector} from 'react-redux';
import {dataForActiveEventSelector, loadingSelector} from '../../data/selectors';
import EventTitle from './EventTitle';
import BreweryCard from './BreweryCard';
import Loading from './Loading';

const BreweryList = () => {
  const data = useSelector(dataForActiveEventSelector);

  return (
    <>
      {data.map((b) => (
        <BreweryCard key={b.name} brewery={b} />
      ))}
    </>
  );
};

const List = () => {
  const loading = useSelector(loadingSelector);

  const Content = loading ? Loading : BreweryList;
  return (
    <>
      <EventTitle />
      <Content />
    </>
  );
};

export default List;
