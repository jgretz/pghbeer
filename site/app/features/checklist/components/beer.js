import React from 'react';
import {compose, withMemo} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';
import {limitLength} from '../../shared/services';

const Beer = ({classes, beer, beerName}) => (
  <div className={classes.beerContainer}>
    <div className={classes.checkContainer}></div>
    <div className={classes.detailContainer}>
      <div className={classes.name}>{beerName}</div>
      <div className={classes.detail}>
        {beer.style.name} | {beer.abv}%
      </div>
    </div>
  </div>
);

export default compose(
  withMemo('beerName', ({beer}) => limitLength(beer.name, 24)),

  withStyles(theme => ({
    beerContainer: {
      marginTop: 10,

      display: 'flex',
      flexDirection: 'row',

      alignItems: 'center',
      justifyContent: 'flex-start',
    },

    checkContainer: {
      borderRadius: '50%',

      height: 75,
      width: 75,

      backgroundColor: theme.palette.secondary.main,
    },
    detailContainer: {
      flexGrow: 1,

      marginLeft: -16,
      padding: '5px 15px 5px 10px',
      height: 60,

      backgroundColor: theme.palette.secondary.main,
    },

    name: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
  })),
)(Beer);
