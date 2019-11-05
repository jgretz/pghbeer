import {stateReducer} from '@truefit/redux-utils';
import {BEERS_LOADED_FROM_SERVER} from '../actions';

export default stateReducer([], {
  [BEERS_LOADED_FROM_SERVER]: (_, payload) => payload,
});
