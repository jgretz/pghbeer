import {loadDataFromServer} from '../../shared/actions';

export const loadStatsForEventFromServer = eventId =>
  loadDataFromServer(`statsForEvent/${eventId}`);
