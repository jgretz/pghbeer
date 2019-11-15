import {getWebUserId} from '../../users/services';
import {makeDataReducer} from '../../shared/services';

export default makeDataReducer(`statsForUser/${getWebUserId()}`, []);
