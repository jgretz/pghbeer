import {loadDataFromServer} from '../../shared/actions';

export const loadBeersForEventsFromServer = () =>
  loadDataFromServer('eventbeerlist');
