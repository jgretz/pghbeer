import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {Stat, User} from '../Types';

export type ActiveUserState = {
  user?: User;
  stats?: Stat[];
};

const INITIAL: ActiveUserState = {
  user: null,
  stats: null,
};

export default createReducer(INITIAL, {
  [LoadDataActions.UserLoaded]: (state: ActiveUserState, action: PayloadAction<User>) => ({
    user: action.payload,
    stats: state.stats,
  }),

  [LoadDataActions.UserStatsLoaded]: (state: ActiveUserState, action: PayloadAction<Stat[]>) => ({
    user: state.user,
    stats: action.payload,
  }),
});
