import React from 'react';

import {compose} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';

import {ScrollElement} from 'react-scroll';

import Beer from './beer';

const Brewery = ({classes, brewery}) => (
  <div
    className={classes.breweryBlockContainer}
    name={brewery.name.substring(0, 1)}
  >
    <div className={classes.breweryTitleContainer}>
      <h1 className={classes.breweryTitle}>{brewery.name}</h1>
    </div>
    {brewery.beers.map(b => (
      <Beer key={b.id} beer={b} />
    ))}
  </div>
);

export default compose(
  withStyles(theme => ({
    breweryBlockContainer: {
      marginBottom: '8px',
    },
    breweryTitleContainer: {
      display: 'inline-block',
      margin: '2px 0',
      padding: '4px 8px',
      backgroundColor: 'rgba(175, 175, 175, .8)',
      borderRadius: '8px',
    },
    breweryTitle: {
      margin: 0,
      padding: 0,
      color: theme.palette.primary.main,
    },
  })),
)(ScrollElement(Brewery));
