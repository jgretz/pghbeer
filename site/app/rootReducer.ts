/* eslint-disable sort-imports */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
import {combineReducers} from 'redux';

import data, {DataState} from './features/data/reducers';

export type ApplicationState = {
  features: {
    data: DataState;
  };
};

const createRootReducer = () =>
  combineReducers({
    features: combineReducers({
      data: data,
    }),
  });

export default createRootReducer;
