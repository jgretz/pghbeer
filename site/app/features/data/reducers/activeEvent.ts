import {createReducer, PayloadAction} from '@reduxjs/toolkit';
import {DEFAULT_EVENT_ID} from '../../../constants';

import {LoadDataActions} from '../actions';
import {fromLocalStorage, passIntoLocalStorage} from '../services';
import {Event, EventBeerListItem} from '../Types';

export type ActiveEventState = {
  event: Event;
  beers: EventBeerListItem[];
};

const EVENT_LIST = 'EVENT_LIST';

const INITIAL: ActiveEventState = {
  event: {
    id: DEFAULT_EVENT_ID,
    name: 'Beers of the Burgh',
    date: new Date(2022, 5, 4),
    create_date: new Date(),
    update_date: new Date(),
  },

  beers: fromLocalStorage(EVENT_LIST, []),
};

export default createReducer(INITIAL, {
  [LoadDataActions.BeerListLoaded]: (
    state: ActiveEventState,
    action: PayloadAction<EventBeerListItem[]>,
  ) => ({
    event: state.event,
    beers: passIntoLocalStorage(EVENT_LIST, action.payload),
  }),
});
