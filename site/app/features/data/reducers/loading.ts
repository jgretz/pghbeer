import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';

export type LoadingState = boolean;

const LOADING = 'LOADING';
const INITIAL = fromLocalStorage(LOADING, true);

export default createReducer(INITIAL, {
  [LoadDataActions.Start]: () => INITIAL,
  [LoadDataActions.SetLoading]: (_, action: PayloadAction<boolean>) => action.payload,
  [LoadDataActions.Complete]: () => passIntoLocalStorage(LOADING, false),
});
