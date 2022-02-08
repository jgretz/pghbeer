import _ from 'lodash';
import {createSelector} from 'reselect';
import dataForActiveEventSelector from './dataForActiveEventSelector';

export default createSelector(dataForActiveEventSelector, (data) => {
  const all = data.map((x) => x.name.substring(0, 1));
  const uniq = _.uniq(all);

  return _.sortBy(uniq, (x) => x);
});
