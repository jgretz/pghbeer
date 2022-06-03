// This is a down and dirty load for now because I am trying to get this site
// updated to the new data source ASAP to save money and time

import {get, post} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction, PayloadActionCreator} from '@reduxjs/toolkit';
import {getWebUserId} from '../services';
import {Beer, Brewery, BeerStyle, Event, User, Stat, EventBeerListItem} from '../Types';
import {ApplicationState} from 'rootReducer';
import {activeEventSelector} from '../selectors';

export enum LoadDataActions {
  Start = 'LOAD_DATA/START',

  UserLoaded = 'LOAD_DATA/USER_LOADED',
  UserStatsLoaded = 'LOAD_DATA/USER_STATS_LOADED',

  EventsLoaded = 'LOAD_DATA/EVENTS_LOADED',
  BeersLoaded = 'LOAD_DATA/BEERS_LOADED',
  BreweriesLoaded = 'LOAD_DATA/BREWERIES_LOADED',
  StylesLoaded = 'LOAD_DATA/STYLES_LOADED',

  BeerListLoaded = 'LOAD_DATA/BEER_LIST_LOADED',

  Complete = 'LOAD_DATA/COMPLETE',
}

const started = createAction(LoadDataActions.Start);

const userLoaded = createAction<User>(LoadDataActions.UserLoaded);
const statsLoaded = createAction<Stat[]>(LoadDataActions.UserStatsLoaded);

const eventsLoaded = createAction<Event[]>(LoadDataActions.EventsLoaded);
const beersLoaded = createAction<Beer[]>(LoadDataActions.BeersLoaded);
const breweriesLoaded = createAction<Brewery[]>(LoadDataActions.BreweriesLoaded);
const stylesLoaded = createAction<BeerStyle[]>(LoadDataActions.StylesLoaded);

const beerListLoaded = createAction<EventBeerListItem[]>(LoadDataActions.BeerListLoaded);

const complete = createAction(LoadDataActions.Complete);

const getArrayOf = async <T>(url: string): Promise<T[]> => {
  const response = await get<T[]>(url);

  // handle the case where bad data comes back because something may be down
  if (response.data.constructor !== Array) {
    return [];
  }

  return response.data;
};

const loadUser = async () => {
  const webUserId = getWebUserId();

  const existing = await getArrayOf<User>(`/users?webuserid=${webUserId}`);
  if (existing.length >= 1) {
    return existing[0];
  }

  const newUserResponse = await post<User>(`/users`, {
    name: 'anonymous',
    email: '',
    webuserid: webUserId,
  });
  return newUserResponse.data;
};

const loadUserStats = async (user: User, event: Event) => {
  const data = await getArrayOf<Stat>(`/stats?user_id=${user.id}&event_id=${event.id}`);

  return data;
};

const loadUserAndStats = async (dispatch: Dispatch, event: Event) => {
  const user = await loadUser();
  dispatch(userLoaded(user));

  const stats = await loadUserStats(user, event);
  dispatch(statsLoaded(stats));
};

const loadListBasedData = async <T>(
  url: string,
  dispatch: Dispatch,
  actionCreator: PayloadActionCreator<T[]>,
) => {
  const data = await getArrayOf<T>(`/${url}`);

  dispatch(actionCreator(data));
};

const loadIndependentLists = async (dispatch: Dispatch) => {
  await Promise.all([
    loadListBasedData<Event>('events', dispatch, eventsLoaded),
    loadListBasedData<Beer>('beers', dispatch, beersLoaded),
    loadListBasedData<Brewery>('breweries', dispatch, breweriesLoaded),
    loadListBasedData<BeerStyle>('styles', dispatch, stylesLoaded),
  ]);
};

const loadBeerList = async (event: Event) => {
  const data = await getArrayOf<EventBeerListItem>(`/eventbeerlist?event_id=${event.id}`);

  return data;
};

const loadListForEvent = async (dispatch: Dispatch, event: Event) => {
  const beerlist = await loadBeerList(event);
  dispatch(beerListLoaded(beerlist));
};

export const loadData = async (dispatch: Dispatch, getState: () => ApplicationState) => {
  dispatch(started());

  const event = activeEventSelector(getState());

  await Promise.all([
    loadUserAndStats(dispatch, event),
    loadIndependentLists(dispatch),
    loadListForEvent(dispatch, event),
  ]);

  dispatch(complete());
};
