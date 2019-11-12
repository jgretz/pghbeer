import {get} from '@truefit/http-utils';

export const LOADING_DATA_FROM_SERVER = 'LOADING_DATA_FROM_SERVER';
export const DATA_LOADED_FROM_SERVER = 'DATA_LOADED_FROM_SERVER';

export const loadDataFromServer = route => async dispatch => {
  dispatch({type: LOADING_DATA_FROM_SERVER, payload: route});

  const response = await get(route);

  dispatch({
    type: DATA_LOADED_FROM_SERVER,
    payload: {
      route,
      data: response.data,
    },
  });
};
