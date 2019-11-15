export const RECORD_OPINION = 'RECORD_OPINION';

export const recordOpinion = (stat, opinion) => ({
  type: RECORD_OPINION,
  payload: {stat, opinion},
});
