import massive from 'massive';
import {parse} from 'pg-connection-string';
import {MassiveConnectOptions} from '@nestjsplus/massive';
import {DATABASE_CONFIG, DATABASE} from '../constants';

let database = null;
let databaseInit = null;

const parseOptions = () => {
  const parseOptions = parse(DATABASE_CONFIG.databaseUrl);
  const ssl = {
    rejectUnauthorized: false,
  };

  return {
    host: parseOptions.host,
    port: parseInt(parseOptions.port, 10),
    user: parseOptions.user,
    password: parseOptions.password,
    database: parseOptions.database,
    ssl: ssl,
  };
};

export const Database = {
  provide: DATABASE,
  useFactory: async () => {
    // we should only create one instance of the database connection, but we also need to be able to depend on it from multiple modules
    if (database) {
      return database;
    }

    if (!databaseInit) {
      const options = parseOptions();
      databaseInit = massive(options);
    }
    database = await databaseInit;
    databaseInit = null;

    return database;
  },
};
