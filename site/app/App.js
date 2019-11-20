import React from 'react';
import {withRouter} from 'react-router';

import {compose, withEffect} from '@truefit/bach';
import {withActions, withSelector} from '@truefit/bach-redux';

import {MuiThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Routes} from './features/shared/components';

import {loadBaseDataFromServer} from './features/data/actions';
import {themeDefinitionSelector} from './features/shared/selectors';

const App = ({theme}) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />

    <Routes />
  </MuiThemeProvider>
);

export default withRouter(
  compose(
    withActions({loadBaseDataFromServer}),
    withEffect(({loadBaseDataFromServer}) => {
      loadBaseDataFromServer();
    }, []),

    withSelector('theme', themeDefinitionSelector),
  )(App),
);
