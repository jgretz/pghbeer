import React from 'react';
import {compose} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';

import Lights from '../../../images/lights.png';
import BotbLogo from '../../../images/botb-logo.png';

import Search from './search';
import InfoIcon from './infoIcon';
import JumpIcon from './jumpIcon';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const Navbar = ({classes}) => (
  <div className={classes.nav}>
    <AppBar>
      <Toolbar>
        <img src={BotbLogo} className={classes.botbLogo} />

        <Search />
        <JumpIcon />
        <InfoIcon />
      </Toolbar>
    </AppBar>
    <Toolbar />
    <div className={classes.lights} />
  </div>
);

export default compose(
  withStyles({
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,

      height: 96,
      width: '100%',
    },
    lights: {
      position: 'fixed',

      height: '40px',
      minWidth: '100hw',
      width: '100%',

      backgroundImage: `url(${Lights})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
    botbLogo: {
      marginTop: -5,
      marginLeft: -10,
      height: 40,
    },
  }),
)(Navbar);