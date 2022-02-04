/* eslint-disable global-require */
import {configureStore, Reducer} from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import asyncAwaitMiddleware from 'redux-async-await';
import createRootReducer, {ApplicationState} from '../rootReducer';

// scaffolding
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const middleware = [thunkMiddleware, asyncAwaitMiddleware];
const reducer = createRootReducer();

// export configure func
export default () => {
  const store = configureStore({
    reducer,
    middleware,
    devTools: IS_PRODUCTION || {
      name: 'PghBeer',
    },
  });

  if (module.hot) {
    module.hot.accept('../rootReducer', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newRootReducer: Reducer<ApplicationState> = require('../rootReducer').default;
      store.replaceReducer(newRootReducer);
    });
  }

  return store;
};
