// This is a down and dirty load for now because I am trying to get this site
// updated to the new data source ASAP to save money and time

import {get, post} from '@truefit/http-utils';
import {Dispatch} from 'redux';
import {createAction, PayloadActionCreator} from '@reduxjs/toolkit';
import {getWebUserId} from '../services';
import {Beer, Brewery, BeerStyle, User, Stat, EventBeerListItem} from '../Types';
import {EVENT_ID} from '../../../constants';

export enum LoadDataActions {
  Start = 'LOAD_DATA/START',

  UserLoaded = 'LOAD_DATA/USER_LOADED',
  UserStatsLoaded = 'LOAD_DATA/USER_STATS_LOADED',

  BeersLoaded = 'LOAD_DATA/BEERS_LOADED',
  BreweriesLoaded = 'LOAD_DATA/BREWERIES_LOADED',
  StylesLoaded = 'LOAD_DATA/STYLES_LOADED',

  BeerListLoaded = 'LOAD_DATA/BEER_LIST_LOADED',

  Complete = 'LOAD_DATA/COMPLETE',
}

const started = createAction(LoadDataActions.Start);

const userLoaded = createAction<User>(LoadDataActions.UserLoaded);
const statsLoaded = createAction<Stat[]>(LoadDataActions.UserStatsLoaded);

const beersLoaded = createAction<Beer[]>(LoadDataActions.BeersLoaded);
const breweriesLoaded = createAction<Brewery[]>(LoadDataActions.BreweriesLoaded);
const stylesLoaded = createAction<BeerStyle[]>(LoadDataActions.StylesLoaded);

const beerListLoaded = createAction<EventBeerListItem[]>(LoadDataActions.BeerListLoaded);

const complete = createAction(LoadDataActions.Complete);

const loadUser = async () => {
  const webUserId = getWebUserId();

  const existing = await get<User[]>(`/users?webuserid=${webUserId}`);
  if (existing.data.length >= 1) {
    return existing.data[0];
  }

  const newUserResponse = await post<User>(`/users`, {
    name: 'anonymous',
    email: '',
    webuserid: webUserId,
  });
  return newUserResponse.data;
};

const loadUserStats = async (user: User) => {
  const response = await get<Stat[]>(`/stats?user_id=${user.id}&event_id=${EVENT_ID}`);

  return response.data;
};

const loadListBasedData = async <T>(
  url: string,
  dispatch: Dispatch,
  actionCreator: PayloadActionCreator<T[]>,
) => {
  const response = await get<T[]>(`/${url}`);

  dispatch(actionCreator(response.data));
};

const loadBeerList = async () => {
  const response = await get<EventBeerListItem[]>(`/eventbeerlist?event_id=${EVENT_ID}`);

  return response.data;
};

export const loadData = async (dispatch: Dispatch) => {
  dispatch(started());

  const user = await loadUser();
  dispatch(userLoaded(user));

  const stats = await loadUserStats(user);
  dispatch(statsLoaded(stats));

  await loadListBasedData<Beer>('beers', dispatch, beersLoaded);
  await loadListBasedData<Brewery>('breweries', dispatch, breweriesLoaded);
  await loadListBasedData<BeerStyle>('styles', dispatch, stylesLoaded);

  const beerlist = await loadBeerList();
  dispatch(beerListLoaded(beerlist));

  dispatch(complete());
};
