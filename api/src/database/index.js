import massive from 'massive';
import {DATABASE_CONFIG, DATABASE} from '../constants';

let database = null;
let databaseInit = null;

export const Database = {
  provide: DATABASE,
  useFactory: async () => {
    // we should only create one instance of the database connection, but we also need to be able to depend on it from multiple modules
    if (database) {
      return database;
    }

    if (!databaseInit) {
      databaseInit = massive(DATABASE_CONFIG.databaseUrl);
    }
    database = await databaseInit;
    databaseInit = null;

    return database;
  },
};
