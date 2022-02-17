import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {BeerStyle} from '../Types';

export type StylesState = BeerStyle[];

const BEER_STYLES = 'BEER_STYLES';
const INITIAL: BeerStyle[] = fromLocalStorage(BEER_STYLES, []);

export default createReducer(INITIAL, {
  [LoadDataActions.StylesLoaded]: (_, action: PayloadAction<BeerStyle[]>) =>
    passIntoLocalStorage(BEER_STYLES, action.payload),
});
