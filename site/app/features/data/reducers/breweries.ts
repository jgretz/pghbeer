import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {Brewery} from '../Types';

export type BreweriesState = Brewery[];

const INITIAL: Brewery[] = [];

export default createReducer(INITIAL, {
  [LoadDataActions.BreweriesLoaded]: (_, action: PayloadAction<Brewery[]>) => action.payload,
});
