import {stateReducer} from '@truefit/redux-utils';
import produce from 'immer';

import {LOADING_DATA_FROM_SERVER, DATA_LOADED_FROM_SERVER} from '../actions';

export default stateReducer([], {
  [LOADING_DATA_FROM_SERVER]: (state, payload) =>
    produce(state, draft => {
      draft.push(payload);
    }),

  [DATA_LOADED_FROM_SERVER]: (state, payload) =>
    produce(state, draft => {
      return draft.filter(x => x !== payload.route);
    }),
});
