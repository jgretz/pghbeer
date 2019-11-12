/* eslint-disable sort-imports */
import {combineReducers} from 'redux';
import beersForEvents from './beersForEvents.js';
import events from './events.js';

export default combineReducers({
  beersForEvents,
  events,
});
