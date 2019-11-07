import {get} from '@truefit/http-utils';

export const BEERS_LOADED_FROM_SERVER = 'BEERS_LOADED_FROM_SERVER';

export const loadBeersFromServer = async () => {
  const response = await get('beers');

  return {
    type: BEERS_LOADED_FROM_SERVER,
    payload: response.data,
  };
};
