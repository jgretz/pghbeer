import React, {ChangeEvent, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import {Theme, alpha} from '@mui/material/styles';

import {AppBar, InputBase, Toolbar} from '@mui/material';
import {Search} from '@mui/icons-material';

import BotbLogo from '../../../images/botb-logo.jpg';
import {setSearchTerm} from '../../data/actions';

const useStyles = makeStyles((theme: Theme) => ({
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
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },

    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    width: '100%',
  },

  searchIcon: {
    width: theme.spacing(4),
    height: '100%',

    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 5),
    transition: theme.transitions.create('width'),
  },
}));

// TODO: navigation icons
const SearchBox = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);

      dispatch(setSearchTerm(event.target.value));
    },
    [setSearch],
  );

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <Search />
      </div>

      <InputBase
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{'aria-label': 'search'}}
        onChange={handleChange}
        value={search}
      />
    </div>
  );
};

const Navigation = () => {
  const classes = useStyles();

  return (
    <div className={classes.nav}>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <img src={BotbLogo} className={classes.botbLogo} />

          <SearchBox />

          {/*
          <JumpIcon />
          <InfoIcon /> */}
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default Navigation;
