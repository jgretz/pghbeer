import {post, put, del} from '@truefit/http-utils';

import {updateStatWithId} from '../actions';
import {
  BEER_CONSUMED,
  RECORD_OPINION,
  REMOVE_BEER_CONSUMED,
} from '../../checklist/actions';

const postBeerConsumed = async (store, action) => {
  const response = await post('stats', action.payload);

  store.dispatch(updateStatWithId(response.data.id, action.payload));
};

const putOpinion = async (_, action) => {
  const stat = action.payload.stat;
  const opinion = action.payload.opinion;
  if (!stat.id) {
    return;
  }

  await put(`stats/${stat.id}`, {...stat, opinion});
};

const removeBeerConsumed = async (_, action) => {
  const stat = action.payload;
  if (!stat.id) {
    return;
  }

  await del(`stats/${stat.id}`);
};

const ACTION_MAP = {
  [BEER_CONSUMED]: postBeerConsumed,
  [RECORD_OPINION]: putOpinion,
  [REMOVE_BEER_CONSUMED]: removeBeerConsumed,
};

export default store => next => action => {
  next(action);

  const handler = ACTION_MAP[action.type];
  if (handler) {
    handler(store, action, next);
  }
};
