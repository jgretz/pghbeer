import {createReducer, PayloadAction} from '@reduxjs/toolkit';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {Event} from '../Types';

export type EventsState = Event[];

const EVENTS = 'EVENTS';
const INITIAL: Event[] = fromLocalStorage(EVENTS, []);

export default createReducer(INITIAL, {
  [LoadDataActions.EventsLoaded]: (_, action: PayloadAction<Event[]>) =>
    passIntoLocalStorage(EVENTS, action.payload),
});
