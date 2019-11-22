import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import statsForSelectedEventSelector from './statsForSelectedEventSelector';

const reduce = _.reduce.convert({cap: false});

export default createSelector(
  statsForSelectedEventSelector,
  stats =>
    stats
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
