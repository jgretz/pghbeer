/* eslint-disable sort-imports */
import {combineReducers} from 'redux';
import activeEvent, {ActiveEventState} from './activeEvent';
import activeUser, {ActiveUserState} from './activeUser';
import beers, {BeersState} from './beers';
import breweries, {BreweriesState} from './breweries';
import loading, {LoadingState} from './loading';
import searchTerm, {SearchTermState} from './searchTerm';
import styles, {StylesState} from './styles';

export type DataState = {
  activeEvent: ActiveEventState;
  activeUser: ActiveUserState;
  beers: BeersState;
  breweries: BreweriesState;
  loading: LoadingState;
  searchTerm: SearchTermState;
  styles: StylesState;
};

export default combineReducers({
  activeEvent,
  activeUser,
  beers,
  breweries,
  loading,
  searchTerm,
  styles,
});
