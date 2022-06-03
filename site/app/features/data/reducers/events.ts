import {createReducer, PayloadAction} from '@reduxjs/toolkit';
import {compareDesc} from 'date-fns/esm';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {Event} from '../Types';

export type EventsState = Event[];

const EVENTS = 'EVENTS';
const INITIAL: Event[] = fromLocalStorage(EVENTS, []);

export default createReducer(INITIAL, {
  [LoadDataActions.EventsLoaded]: (_, action: PayloadAction<Event[]>) => {
    const data = action.payload;
    data.forEach((event: Event) => {
      if (event.date.constructor === String) {
        event.date = new Date(Date.parse(event.date as string));
      }
    });

    const sorted = data.sort((a, b) => compareDesc(a.date, b.date));

    return passIntoLocalStorage(EVENTS, sorted);
  },
});
