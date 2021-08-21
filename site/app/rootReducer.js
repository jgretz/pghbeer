/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import beers from './features/beers/reducers';
import breweries from './features/breweries/reducers';
import checklist from './features/checklist/reducers';
import events from './features/events/reducers';
import navigation from './features/navigation/reducers';
import stats from './features/stats/reducers';
import shared from './features/shared/reducers';
import users from './features/users/reducers';
import styles from './features/styles/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      beers: beers,
      breweries: breweries,
      checklist: checklist,
      events: events,
      navigation: navigation,
      stats: stats,
      shared: shared,
      users: users,
      styles: styles,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
