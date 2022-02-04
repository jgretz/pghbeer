import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {BeerStyle} from '../Types';

export type StylesState = BeerStyle[];

const INITIAL: BeerStyle[] = [];

export default createReducer(INITIAL, {
  [LoadDataActions.StylesLoaded]: (_, action: PayloadAction<BeerStyle[]>) => action.payload,
});
