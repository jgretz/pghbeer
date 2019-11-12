/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import breweries from './features/breweries/reducers';
import beers from './features/beers/reducers';
import events from './features/events/reducers';
import shared from './features/shared/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      breweries: breweries,
      beers: beers,
      events: events,
      shared: shared,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
