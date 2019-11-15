import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import listForSelectedEventSelector from './listForSelectedEventSelector';

export default createSelector(
  listForSelectedEventSelector,
  list =>
    Object.keys(list)
    |> _.map(x => x.substring(0, 1))
    |> _.uniq
    |> _.sortBy(x => x),
);
