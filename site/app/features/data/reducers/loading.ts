import {createReducer} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';

export type LoadingState = boolean;

const INITIAL = false;

export default createReducer(INITIAL, {
  [LoadDataActions.Start]: () => true,
  [LoadDataActions.Complete]: () => false,
});