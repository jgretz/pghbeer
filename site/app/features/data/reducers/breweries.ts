import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {Brewery} from '../Types';

export type BreweriesState = Brewery[];

const BREWERIES = 'BREWERIES';
const INITIAL: Brewery[] = fromLocalStorage(BREWERIES, []);

export default createReducer(INITIAL, {
  [LoadDataActions.BreweriesLoaded]: (_, action: PayloadAction<Brewery[]>) =>
    passIntoLocalStorage(BREWERIES, action.payload),
});
