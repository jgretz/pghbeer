import {createReducer, PayloadAction} from '@reduxjs/toolkit';
import {EVENT_ID} from '../../../constants';

import {LoadDataActions} from '../actions';
import {Event, EventBeerListItem} from '../Types';

export type ActiveEventState = {
  event: Event;
  beers: EventBeerListItem[];
};

const INITIAL: ActiveEventState = {
  event: {
    id: EVENT_ID,
    name: 'Beers of the Burgh',
    create_date: new Date(),
    update_date: new Date(),
  },

  beers: [],
};

export default createReducer(INITIAL, {
  [LoadDataActions.BeerListLoaded]: (
    state: ActiveEventState,
    action: PayloadAction<EventBeerListItem[]>,
  ) => ({
    event: state.event,
    beers: action.payload,
  }),
});
