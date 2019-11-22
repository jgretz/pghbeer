import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import statsForSelectedEventSelector from './statsForSelectedEventSelector';
import {OPINION} from '../constants';

const reduce = _.reduce.convert({cap: false});

export default createSelector(
  statsForSelectedEventSelector,
  stats =>
    stats
    |> _.filter(s => s.opinion === OPINION.LIKE)
    |> _.groupBy(s => s.beer_id)
    |> reduce(
      (acc, array, key) => [
        ...acc,
        {beer_id: parseInt(key), count: array.length},
      ],
      [],
    )
    |> _.sortBy(x => 1 / x.count)
    |> _.take(10),
);
