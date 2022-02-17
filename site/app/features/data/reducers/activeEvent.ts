import {createReducer, PayloadAction} from '@reduxjs/toolkit';
import {EVENT_ID} from '../../../constants';

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
    id: EVENT_ID,
    name: 'Beers of the Burgh',
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
