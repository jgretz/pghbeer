import _ from 'lodash/fp';
import React from 'react';
import {compose, withMemo} from '@truefit/bach';
import {withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import {listForEventSelector} from '../selectors';

import Brewery from './brewery';

const List = ({classes, breweries}) => (
  <div className={classes.container}>
    {breweries.map(b => (
      <Brewery key={b.name} brewery={b} />
    ))}
  </div>
);

export default compose(
  withSelector('list', listForEventSelector),
  withMemo(
    'breweries',
    ({list}) =>
      Object.keys(list)
      |> _.map(x => ({name: x, beers: list[x]}))
      |> _.sortBy(x => x.name),
  ),

  withStyles({
    container: {
      padding: '90px 10px 20px 10px',
    },
  }),
)(List);
