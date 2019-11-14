import React from 'react';
import {compose} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';

import Beer from './beer';

const Brewery = ({brewery}) => (
  <div>
    <h1>{brewery.name}</h1>
    {brewery.beers.map(b => (
      <Beer key={b.id} beer={b} />
    ))}
  </div>
);

export default compose(withStyles({}))(Brewery);
