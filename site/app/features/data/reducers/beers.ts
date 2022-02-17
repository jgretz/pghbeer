import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {Beer} from '../Types';

export type BeersState = Beer[];

const BEERS = 'BEERS';
const INITIAL: Beer[] = fromLocalStorage(BEERS, []);

export default createReducer(INITIAL, {
  [LoadDataActions.BeersLoaded]: (_, action: PayloadAction<Beer[]>) =>
    passIntoLocalStorage(BEERS, action.payload),
});
