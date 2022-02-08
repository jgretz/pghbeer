import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/material/styles';

import BeerCard from './BeerCard';

import {BeerDetail} from '../../data/Types';

interface Props {
  brewery: {
    name: string;
    detail: BeerDetail[];
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  breweryBlockContainer: {
    marginBottom: '8px',
  },
  breweryTitleContainer: {
    display: 'inline-block',
    margin: '2px 0',
    padding: '4px 8px',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    borderRadius: '8px',
  },
  breweryTitle: {
    margin: 0,
    padding: 0,
    color: theme.palette.secondary.main,
  },
}));

const BreweryCard = ({brewery}: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.breweryBlockContainer} name={brewery.name.substring(0, 1)}>
      <div className={classes.breweryTitleContainer}>
        <h1 className={classes.breweryTitle}>{brewery.name}</h1>
      </div>

      {brewery.detail.map((b) => (
        <BeerCard key={b.beer.id} beer={b} />
      ))}
    </div>
  );
};

export default BreweryCard;
