import {makeDataReducer} from '../../shared/services';
import {getWebUserId} from '../../users/services';

export default makeDataReducer(`userByWebUserId/${getWebUserId()}`, []);
