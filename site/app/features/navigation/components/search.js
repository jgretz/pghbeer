import React from 'react';
import {compose, withCallback} from '@truefit/bach';
import {withActions, withSelector} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';

import {fade} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

import {updateSearch} from '../actions';
import {searchSelector} from '../selectors';

const Search = ({classes, search, handleChange}) => (
  <div className={classes.search}>
    <div className={classes.searchIcon}>
      <SearchIcon />
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

export default compose(
  withActions({updateSearch}),
  withCallback('handleChange', ({updateSearch}) => e => {
    updateSearch(e.target.value);
  }),

  withSelector('search', searchSelector),

  withStyles(theme => ({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
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
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 5),
      transition: theme.transitions.create('width'),
    },
  })),
)(Search);
