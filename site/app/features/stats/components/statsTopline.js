import React from 'react';
import {compose} from '@truefit/bach';
import {withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import {toplineStatsSelector} from '../selectors';

const StatsTopline = ({classes, stats}) => (
  <div>
    <h2>Overall Stats</h2>
    <div className={classes.statContainer}>
      <div className={classes.title}>Total Checks: </div>
      <div className={classes.detail}>{stats.totalChecks}</div>
    </div>
    <div className={classes.statContainer}>
      <div className={classes.title}>Total Likes: </div>
      <div className={classes.detail}>{stats.totalLikes}</div>
    </div>
    <div className={classes.statContainer}>
      <div className={classes.title}>Total Dislikes: </div>
      <div className={classes.detail}>{stats.totalDislikes}</div>
    </div>
    <div className={classes.statContainer}>
      <div className={classes.title}>Unique Beers: </div>
      <div className={classes.detail}>{stats.uniqBeersCount}</div>
    </div>
    <div className={classes.statContainer}>
      <div className={classes.title}>Unique Users: </div>
      <div className={classes.detail}>{stats.uniqUsersCount}</div>
    </div>
  </div>
);

export default compose(
  withSelector('stats', toplineStatsSelector),
  withStyles({
    statContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    title: {
      fontWeight: 'bold',
      width: 120,
    },
  }),
)(StatsTopline);
