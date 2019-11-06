if (process.env.NODE_ENV !== 'PRODUCTION') {
  require('./private').default();
}

export const DATABASE_CONFIG = {
  databaseUrl: process.env.DATABASE_URL,
};

export const AUTH_CONFIG = {
  key: process.env.AUTH_KEY,
};

export const DATABASE = 'DATABASE';
