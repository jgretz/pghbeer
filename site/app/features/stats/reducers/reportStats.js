import {stateReducer} from '@truefit/redux-utils';
import {DATA_LOADED_FROM_SERVER} from '../../shared/actions';

export default stateReducer([], {
  [DATA_LOADED_FROM_SERVER]: (state, payload) =>
    payload.route.includes('statsForEvent') ? payload.data : state,
});
