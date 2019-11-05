/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import beers from './features/beers/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      beers: beers,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
