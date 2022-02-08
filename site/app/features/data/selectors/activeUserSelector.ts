import {ApplicationState} from 'rootReducer';

export default (state: ApplicationState) => state.features.data.activeUser.user;
