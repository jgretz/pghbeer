if (process.env.NODE_ENV !== 'PRODUCTION') {
  require('./private').default();
}

export const AZURE_CONFIG = {
  endpoint: process.env.AZURE_ENDPOINT,
  primaryKey: process.env.AZURE_PRIMARY_KEY,
  database: process.env.AZURE_DATABASE,
  collection: process.env.AZURE_COLLECTION,
};
