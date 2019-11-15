export const UPDATE_STATE_WITH_ID = 'UPDATE_STATE_WITH_ID';

export const updateStatWithId = (id, stat) => ({
  type: UPDATE_STATE_WITH_ID,
  payload: {id, stat},
});
