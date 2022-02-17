import _ from 'lodash';
import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions, RecordOpinionActions, RemoveOpinionActions} from '../actions';
import {Stat, User} from '../Types';
import {fromLocalStorage, passIntoLocalStorage} from '../services';

const USER = 'USER';
const STATS = 'STATS';

export type ActiveUserState = {
  user?: User;
  stats?: Stat[];
};

const INITIAL: ActiveUserState = {
  user: fromLocalStorage(USER, null),
  stats: fromLocalStorage(STATS, []),
};

export default createReducer(INITIAL, {
  [LoadDataActions.UserLoaded]: (state: ActiveUserState, action: PayloadAction<User>) => ({
    user: passIntoLocalStorage(USER, action.payload),
    stats: state.stats,
  }),

  [LoadDataActions.UserStatsLoaded]: (state: ActiveUserState, action: PayloadAction<Stat[]>) => ({
    user: state.user,
    stats: passIntoLocalStorage(STATS, action.payload),
  }),

  [RecordOpinionActions.Record]: ({stats}: ActiveUserState, {payload}: PayloadAction<Stat>) => {
    const index = _.findIndex(stats, (s) => s.id === payload.id);

    if (index > -1) {
      stats[index] = payload;
    } else {
      stats.push(payload);
    }

    passIntoLocalStorage(STATS, stats);
  },

  [RemoveOpinionActions.Remove]: (
    {user, stats}: ActiveUserState,
    {payload}: PayloadAction<Stat>,
  ) => {
    return {
      user,
      stats: passIntoLocalStorage(
        STATS,
        stats.filter((s) => s.id !== payload.id),
      ),
    };
  },
});
