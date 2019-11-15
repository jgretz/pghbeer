import moment from 'moment';
import {selectedEventSelector} from '../selectors';
import {activeUserSelector} from '../../users/selectors';
import {OPINION} from '../../stats/constants';

export const BEER_CONSUMED = 'BEER_CONSUMED';

export const recordBeerConsumed = beer => (dispatch, getState) => {
  const state = getState();
  const selectedEvent = selectedEventSelector(state);
  const activeUser = activeUserSelector(state);

  dispatch({
    type: BEER_CONSUMED,
    payload: {
      date: moment.utc().toDate(),
      opinion: OPINION.UNKNOWN,
      beer_id: beer.id,
      user_id: activeUser.id,
      event_id: selectedEvent,
    },
  });
};
