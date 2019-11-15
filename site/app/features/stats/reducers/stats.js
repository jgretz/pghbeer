import _ from 'lodash/fp';
import produce from 'immer';

import {getWebUserId} from '../../users/services';
import {makeDataReducer} from '../../shared/services';

import {UPDATE_STATE_WITH_ID} from '../actions';
import {
  BEER_CONSUMED,
  RECORD_OPINION,
  REMOVE_BEER_CONSUMED,
} from '../../checklist/actions';

const route = `statsForUser/${getWebUserId()}`;

const findMatchingStat = (draft, stat) =>
  draft
  |> _.find(
    x =>
      x.beer_id === stat.beer_id &&
      x.event_id === stat.event_id &&
      x.user_id === stat.user_id,
  );

export default makeDataReducer(route, [], {
  [BEER_CONSUMED]: (state, payload) =>
    produce(state, draft => {
      draft.push(payload);
    }),

  [UPDATE_STATE_WITH_ID]: (state, {id, stat}) =>
    produce(state, draft => {
      const existing = findMatchingStat(draft, stat);

      if (existing) {
        existing.id = id;

        localStorage.setItem(route, JSON.stringify(draft));
      }
    }),

  [RECORD_OPINION]: (state, {stat, opinion}) =>
    produce(state, draft => {
      const existing = findMatchingStat(draft, stat);

      if (existing) {
        existing.opinion = opinion;

        localStorage.setItem(route, JSON.stringify(draft));
      }
    }),

  [REMOVE_BEER_CONSUMED]: (state, payload) =>
    produce(state, draft => {
      const existing = findMatchingStat(draft, payload);

      if (existing) {
        draft.splice(draft.indexOf(existing), 1);

        localStorage.setItem(route, JSON.stringify(draft));
      }
    }),
});
