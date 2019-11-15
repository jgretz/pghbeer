/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import breweries from './features/breweries/reducers';
import checklist from './features/checklist/reducers';
import events from './features/events/reducers';
import shared from './features/shared/reducers';
import stats from './features/stats/reducers';
import styles from './features/styles/reducers';
import users from './features/users/reducers';
import beers from './features/beers/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      breweries: breweries,
      checklist: checklist,
      events: events,
      shared: shared,
      stats: stats,
      styles: styles,
      users: users,
      beers: beers,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
