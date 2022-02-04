import './styles/styles.scss';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import {render} from 'react-dom';
import {configureStore, configureHttp} from './util';

// Root and Loading need to stay out here for HMR purposes
import Root from './Root';

// setup
const appElement = document.getElementById('app');
const store = configureStore();

configureHttp();

// render paths
const renderApplication = () => {
  render(<Root store={store} />, appElement);
};
renderApplication();
