import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import BotbLogo from '../../../images/botb-logo.jpg';

const useStyles = makeStyles(() => ({
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,

    height: 96,
    width: '100%',
  },
  toolbar: {
    padding: 0,
  },
  botbLogo: {
    marginTop: -5,
    marginLeft: '6px',
    height: 40,
  },
}));

// TODO: navigation icons

const Navigation = () => {
  const classes = useStyles();

  return (
    <div className={classes.nav}>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <img src={BotbLogo} className={classes.botbLogo} />

          {/* <Search />
          <JumpIcon />
          <InfoIcon /> */}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default Navigation;
