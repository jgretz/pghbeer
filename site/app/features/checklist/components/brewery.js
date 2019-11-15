import React from 'react';

import {ScrollElement} from 'react-scroll';

import Beer from './beer';

const Brewery = ({brewery}) => (
  <div name={brewery.name.substring(0, 1)}>
    <h1>{brewery.name}</h1>
    {brewery.beers.map(b => (
      <Beer key={b.id} beer={b} />
    ))}
  </div>
);

export default ScrollElement(Brewery);
