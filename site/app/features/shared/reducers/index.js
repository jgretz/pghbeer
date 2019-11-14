/* eslint-disable sort-imports */
import {combineReducers} from 'redux';
import loadingTargets from './loadingTargets.js';
import theme from './theme.js';

export default combineReducers({
  loadingTargets,
  theme,
});
