import {loadBeersFromServer} from '../../beers/actions';
import {loadBreweriesFromServer} from '../../breweries/actions';
import {
  loadBeersForEventsFromServer,
  loadEventsFromServer,
} from '../../events/actions';

export const loadBaseDataFromServer = () => dispatch => {
  dispatch(loadBeersFromServer());
  dispatch(loadBreweriesFromServer());
  dispatch(loadEventsFromServer());
  dispatch(loadBeersForEventsFromServer());
};
