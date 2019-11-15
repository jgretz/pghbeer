import {loadBeersFromServer} from '../../beers/actions';
import {loadBreweriesFromServer} from '../../breweries/actions';
import {
  loadBeersForEventsFromServer,
  loadEventsFromServer,
} from '../../events/actions';
import {loadStylesFromServer} from '../../styles/actions';
import {loadStatsForUserFromServer} from '../../stats/actions';
import {loadUserFromServer} from '../../users/actions';

export const loadBaseDataFromServer = () => async dispatch => {
  dispatch(loadUserFromServer());
  dispatch(loadBeersFromServer());
  dispatch(loadBreweriesFromServer());
  dispatch(loadEventsFromServer());
  dispatch(loadStylesFromServer());
  dispatch(loadBeersForEventsFromServer());
  dispatch(loadStatsForUserFromServer());
};
