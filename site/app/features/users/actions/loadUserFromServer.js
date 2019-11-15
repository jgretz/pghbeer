import {post} from '@truefit/http-utils';
import {
  loadDataFromServer,
  DATA_LOADED_FROM_SERVER,
} from '../../shared/actions';
import {getWebUserId} from '../services';

export const loadUserFromServer = () => async dispatch => {
  const webuserid = getWebUserId();
  const route = `userByWebUserId/${webuserid}`;

  const getResponse = await loadDataFromServer(route)(dispatch);
  if (getResponse.data.length > 0) {
    return;
  }

  const postResponse = await post('users', {
    name: 'anonymous',
    webuserid,
  });

  dispatch({
    type: DATA_LOADED_FROM_SERVER,
    payload: {
      route,
      data: [postResponse.data],
    },
  });
};
