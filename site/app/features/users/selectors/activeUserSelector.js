import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import usersSelector from './usersSelector';
import {getWebUserId} from '../services';

export default createSelector(usersSelector, users => {
  const webuserid = getWebUserId();

  return users |> _.find(x => x.webuserid === webuserid);
});
