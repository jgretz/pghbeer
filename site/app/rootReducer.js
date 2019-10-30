/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import checklist from './features/checklist/reducers';

const rootReducer = history =>
  combineReducers({
    features: combineReducers({
      checklist: checklist,
    }),
    router: connectRouter(history),
  });

export default rootReducer;
