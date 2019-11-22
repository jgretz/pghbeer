/* eslint-disable sort-imports */
import {combineReducers} from 'redux';
import reportStats from './reportStats.js';
import stats from './stats.js';

export default combineReducers({
  reportStats,
  stats,
});
