import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import statsForSelectedEventSelector from './statsForSelectedEventSelector';
import {OPINION} from '../constants';

export default createSelector(statsForSelectedEventSelector, stats => {
  const totalChecks = stats.length;
  const totalLikes = stats |> _.filter(s => s.opinion === OPINION.LIKE);
  const totalDislikes = stats |> _.filter(s => s.opinion === OPINION.DISLIKE);

  const uniqBeers = stats |> _.map(s => s.beer_id) |> _.uniq;
  const uniqUsers = stats |> _.map(s => s.user_id) |> _.uniq;

  return {
    totalChecks,
    totalLikes: totalLikes.length,
    totalDislikes: totalDislikes.length,

    uniqBeersCount: uniqBeers.length,
    uniqUsersCount: uniqUsers.length,
  };
});
