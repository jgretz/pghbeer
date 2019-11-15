export const REMOVE_BEER_CONSUMED = 'REMOVE_BEER_CONSUMED';

export const removeBeerConsumed = stat => ({
  type: REMOVE_BEER_CONSUMED,
  payload: stat,
});
