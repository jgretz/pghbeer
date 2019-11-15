import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import statsSelector from './statsSelector';
import {activeUserSelector} from '../../users/selectors';

export default createSelector(
  statsSelector,
  activeUserSelector,
  (stats, activeUser) => stats |> _.filter(x => x.user_id === activeUser.id),
);
