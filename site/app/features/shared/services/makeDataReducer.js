import {stateReducer} from '@truefit/redux-utils';
import {DATA_LOADED_FROM_SERVER} from '../actions';

export default (route, initial, additionalCases = []) =>
  stateReducer(initial, {
    [DATA_LOADED_FROM_SERVER]: (state, payload) =>
      payload.route !== route ? state : payload.data,
    ...additionalCases,
  });
