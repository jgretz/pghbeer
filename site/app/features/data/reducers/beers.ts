import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {Beer} from '../Types';

export type BeersState = Beer[];

const INITIAL: Beer[] = [];

export default createReducer(INITIAL, {
  [LoadDataActions.BeersLoaded]: (_, action: PayloadAction<Beer[]>) => action.payload,
});
