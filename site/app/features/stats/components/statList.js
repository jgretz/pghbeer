import _ from 'lodash/fp';
import React from 'react';
import {compose, withMemo} from '@truefit/bach';
import {withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import {beersSelector} from '../../beers/selectors';
import {breweriesSelector} from '../../breweries/selectors';

const List = ({classes, title, stats}) => (
  <div>
    <h2 className={classes.listTitle}>{title}</h2>
    <div className={classes.container}>
      <div className={classes.detailTitle}>Beer</div>
      <div className={classes.detailTitle}>Brewery</div>
      <div className={classes.smTitle}>Count</div>
    </div>
    {stats.map(stat => (
      <div key={stat.beer_id} className={classes.container}>
        <div className={classes.detail}>{stat.beer?.name}</div>
        <div className={classes.detail}>{stat.brewery?.name}</div>
        <div className={classes.sm}>{stat.count}</div>
      </div>
    ))}
  </div>
);

export default compose(
  withSelector('beers', beersSelector),
  withSelector('breweries', breweriesSelector),

  withMemo('stats', ({data, beers, breweries}) => {
    return data.map(x => {
      const beer = beers |> _.find(b => b.id === x.beer_id);
      const brewery = breweries |> _.find(b => b.id === beer?.brewery_id);

      return {...x, beer, brewery};
    });
  }),

  withStyles({
    container: {
      display: 'flex',
      flexDirection: 'row',

      width: '100%',
    },
    detailTitle: {
      fontWeight: 'bold',

      flex: 1,
      paddingLeft: 5,
      paddingRight: 5,

      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    smTitle: {
      fontWeight: 'bold',

      flex: 0.35,
      paddingLeft: 5,
      paddingRight: 5,

      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'right',
    },

    detail: {
      flex: 1,
      paddingLeft: 5,
      paddingRight: 5,

      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    sm: {
      flex: 0.35,
      paddingLeft: 5,
      paddingRight: 5,

      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'right',
    },
  }),
)(List);
