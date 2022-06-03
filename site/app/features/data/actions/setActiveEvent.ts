import {createAction} from '@reduxjs/toolkit';
import {Event} from '../Types';

export enum SetActiveEventActions {
  SetActiveEvent = 'SET_ACTIVE_EVENT/Set',
}

const activeEventSet = createAction<Event>(SetActiveEventActions.SetActiveEvent);

export const setActiveEvent = (event: Event) => activeEventSet(event);
