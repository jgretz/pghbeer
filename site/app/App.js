import React from 'react';
import {withRouter} from 'react-router';

import {compose, withEffect} from '@truefit/bach';
import {withActions, withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import Background from './images/pghbackground.png';

import {MuiThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Navbar} from './features/navigation/components';
import {Routes} from './features/shared/components';

import {loadBaseDataFromServer} from './features/data/actions';
import {themeDefinitionSelector} from './features/shared/selectors';

const App = ({theme, classes}) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />

    <div className={classes.body}>
      <Navbar />
      <Routes />
    </div>
  </MuiThemeProvider>
);

export default withRouter(
  compose(
    withActions({loadBaseDataFromServer}),
    withEffect(({loadBaseDataFromServer}) => {
      loadBaseDataFromServer();
    }, []),

    withSelector('theme', themeDefinitionSelector),

    withStyles({
      body: {
        minHeight: '100vh',
        height: '100%',
        width: '100hw',

        backgroundImage: `url(${Background})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      },
    }),
  )(App),
);
