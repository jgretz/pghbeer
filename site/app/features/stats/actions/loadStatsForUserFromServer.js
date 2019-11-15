import {getWebUserId} from '../../users/services';
import {loadDataFromServer} from '../../shared/actions';

export const loadStatsForUserFromServer = () =>
  loadDataFromServer(`statsForUser/${getWebUserId()}`);
