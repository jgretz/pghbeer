import {stateReducer} from '@truefit/redux-utils';
import {DATA_LOADED_FROM_SERVER} from '../actions';

export default (route, initial, additionalCases = []) => {
  const json = localStorage.getItem(route);
  const stored = json?.length > 0 ? JSON.parse(json) : initial;

  return stateReducer(stored, {
    [DATA_LOADED_FROM_SERVER]: (state, payload) => {
      if (payload.route !== route) {
        return state;
      }

      localStorage.setItem(route, JSON.stringify(payload.data));

      return payload.data;
    },

    ...additionalCases,
  });
};
