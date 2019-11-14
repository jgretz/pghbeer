/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import breweries from './features/breweries/reducers';
import checklist from './features/checklist/reducers';
import events from './features/events/reducers';
import beers from './features/beers/reducers';
import shared from './features/shared/reducers';
import styles from './features/styles/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      breweries: breweries,
      checklist: checklist,
      events: events,
      beers: beers,
      shared: shared,
      styles: styles,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
