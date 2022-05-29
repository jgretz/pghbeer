import React from 'react';
import {useSelector} from 'react-redux';
import {dataForActiveEventSelector} from '../../data/selectors';
import EventTitle from './EventTitle';
import BreweryCard from './BreweryCard';

const List = () => {
  const data = useSelector(dataForActiveEventSelector);

  return (
    <>
      <EventTitle />
      {data.map((b) => (
        <BreweryCard key={b.name} brewery={b} />
      ))}
    </>
  );
};

export default List;
