import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {SetSearchTermActions} from '../actions';

export type SearchTermState = string;

const INITIAL = '';

export default createReducer(INITIAL, {
  [SetSearchTermActions.Set]: (_, action: PayloadAction<string>) => action.payload,
});
