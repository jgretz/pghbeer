import React from 'react';
import {compose, withMemo} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';
// import {renderIf} from '@truefit/bach-recompose';
import {limitLength} from '../../shared/services';

const BeerCheckboxContentEmpty = ({classes}) => (
  <div className={classes.checkboxEmpty} />
);

const BeerCheckboxContent = compose()(BeerCheckboxContentEmpty);

const BeerCheckbox = ({classes}) => (
  <div className={classes.checkContainer}>
    <BeerCheckboxContent classes={classes} />
  </div>
);

const BeerDetail = ({classes, beer, beerName}) => (
  <div className={classes.detailContainer}>
    <div className={classes.name}>{beerName}</div>
    <div className={classes.detail}>
      {beer.style.name} | {beer.abv}%
    </div>
  </div>
);

const Beer = ({classes, beer, beerName}) => (
  <div className={classes.beerContainer}>
    <BeerCheckbox classes={classes} />
    <BeerDetail classes={classes} beer={beer} beerName={beerName} />
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
      display: 'flex',

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: '50%',

      height: 75,
      width: 75,
      minWidth: 75,

      backgroundColor: theme.palette.secondary.main,
    },
    detailContainer: {
      flexGrow: 1,

      marginLeft: -15,
      padding: '5px 5px 5px 10px',
      height: 60,

      backgroundColor: theme.palette.secondary.main,
    },

    name: {
      fontSize: '1.3em',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
    detail: {
      whiteSpace: 'nowrap',
    },

    checkboxEmpty: {
      borderRadius: '50%',

      height: 45,
      width: 45,

      backgroundColor: theme.palette.common.white,
    },
  })),
)(Beer);
