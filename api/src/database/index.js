import massive from 'massive';
import {DATABASE_CONFIG, DATABASE} from '../constants';

export const Database = {
  provide: DATABASE,
  useFactory: async () => {
    return await massive(DATABASE_CONFIG.databaseUrl);
  },
};
