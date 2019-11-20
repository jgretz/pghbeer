import _ from 'lodash/fp';
import React from 'react';

import {compose, withMemo, withEffect} from '@truefit/bach';
import {withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import {Navbar} from '../../navigation/components';
import Brewery from './brewery';
import Background from '../../../images/pghbackground.png';

import {listForSelectedEventSelector} from '../selectors';

const List = ({classes, breweries}) => (
  <div className={classes.page}>
    <div className={classes.container}>
      <Navbar />
      {breweries.map(b => (
        <Brewery key={b.name} brewery={b} />
      ))}
    </div>
  </div>
);

export default compose(
  withEffect(() => {
    // i wanted to use react-helmet, but it still uses componentWillMount
    document.title = 'BotB - Winter Warmer';
  }, []),

  withSelector('list', listForSelectedEventSelector),
  withMemo(
    'breweries',
    ({list}) =>
      Object.keys(list)
      |> _.map(x => ({name: x, beers: list[x]}))
      |> _.sortBy(x => x.name),
  ),

  withStyles({
    page: {
      minHeight: '100vh',
      minWidth: '100hw',

      height: '100%',
      width: '100%',

      backgroundImage: `url(${Background})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
    container: {
      padding: '90px 10px 20px 10px',

      margin: '0 auto',
      maxWidth: '1200px',
    },
  }),
)(List);
