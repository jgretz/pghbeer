import React from 'react';
import {compose, withEffect} from '@truefit/bach';
import {withActions, withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import ToplineStats from './statsTopline';
import StatList from './statList';

import {loadStatsForEventFromServer} from '../actions';

import {selectedEventSelector} from '../../checklist/selectors';
import {
  topCheckedSelector,
  topLikedSelector,
  topDislikedSelector,
} from '../selectors';

const Stats = ({classes, topChecked, topLiked, topDisliked}) => (
  <div className={classes.container}>
    <ToplineStats />
    <StatList title="Top Checked" data={topChecked} />
    <StatList title="Top Liked" data={topLiked} />
    <StatList title="Top Disliked" data={topDisliked} />
  </div>
);

export default compose(
  withSelector('event', selectedEventSelector),
  withSelector('topChecked', topCheckedSelector),
  withSelector('topLiked', topLikedSelector),
  withSelector('topDisliked', topDislikedSelector),

  withActions({loadStatsForEventFromServer}),
  withEffect(({loadStatsForEventFromServer, event}) => {
    loadStatsForEventFromServer(event);
  }, []),

  withStyles({
    container: {
      padding: 20,

      width: '100%',

      margin: 'auto',
    },
  }),
)(Stats);
