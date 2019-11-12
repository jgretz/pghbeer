import React from 'react';
import {withRouter} from 'react-router';

import {compose, withEffect} from '@truefit/bach';
import {withActions} from '@truefit/bach-redux';

import {Routes} from './features/shared/components';

import {loadBaseDataFromServer} from './features/data/actions';

const App = () => <Routes />;

export default withRouter(
  compose(
    withActions({loadBaseDataFromServer}),

    withEffect(({loadBaseDataFromServer}) => {
      loadBaseDataFromServer();
    }, []),
  )(App),
);
