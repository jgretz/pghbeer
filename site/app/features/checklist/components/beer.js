import React from 'react';

import {compose, withMemo, withCallback} from '@truefit/bach';
import {withActions} from '@truefit/bach-redux';
import {withStyles} from '@truefit/bach-material-ui';
import {renderIf} from '@truefit/bach-recompose';

import IconButton from '@material-ui/core/IconButton';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

import {limitLength} from '../../shared/services';
import {
  recordBeerConsumed,
  recordOpinion,
  removeBeerConsumed,
} from '../actions';
import {OPINION} from '../../stats/constants';

const BeerCheckBoxForKnownOpinion = compose(
  withActions({removeBeerConsumed}),
  withCallback('handleClick', ({removeBeerConsumed, beer}) => () => {
    removeBeerConsumed(beer.stat);
  }),

  withMemo('Icon', ({beer}) =>
    beer.stat.opinion === OPINION.LIKE ? ThumbUpIcon : ThumbDownIcon,
  ),
)(({classes, handleClick, Icon}) => (
  <div className={classes.checkboxCircle} onClick={handleClick}>
    <IconButton onClick={handleClick}>
      <Icon color="secondary" />
    </IconButton>
  </div>
));

const BeerCheckBoxForUnknown = compose(
  withActions({recordOpinion}),
  withCallback('handleLikeClick', ({recordOpinion, beer}) => () => {
    recordOpinion(beer.stat, OPINION.LIKE);
  }),
  withCallback('handleDislikeClick', ({recordOpinion, beer}) => () => {
    recordOpinion(beer.stat, OPINION.DISLIKE);
  }),
)(({classes, handleLikeClick, handleDislikeClick}) => (
  <div>
    <IconButton className={classes.likeButton} onClick={handleLikeClick}>
      <ThumbUpIcon />
    </IconButton>
    <IconButton className={classes.dislikeButton} onClick={handleDislikeClick}>
      <ThumbDownIcon />
    </IconButton>
  </div>
));

const BeerCheckboxForNotDrank = compose(
  withActions({recordBeerConsumed}),
  withCallback('handleClick', ({recordBeerConsumed, beer}) => () => {
    recordBeerConsumed(beer);
  }),
)(({classes, handleClick}) => (
  <div className={classes.checkboxCircle} onClick={handleClick} />
));

const BeerCheckboxContent = compose(
  renderIf(
    ({beer}) => beer.stat?.opinion === OPINION.UNKNOWN,
    BeerCheckBoxForUnknown,
  ),
  renderIf(({beer}) => beer.stat, BeerCheckBoxForKnownOpinion),
)(BeerCheckboxForNotDrank);

const BeerCheckbox = ({classes, beer}) => (
  <div className={classes.checkContainer}>
    <BeerCheckboxContent classes={classes} beer={beer} />
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
    <BeerCheckbox classes={classes} beer={beer} />
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

    checkboxCircle: {
      marginLeft: -3,

      borderRadius: '50%',

      height: 45,
      width: 45,

      backgroundColor: theme.palette.common.white,
    },

    likeButton: {
      marginLeft: 3,
      marginTop: 3,
    },
    dislikeButton: {
      marginTop: -18,
      marginLeft: 21,
    },
  })),
)(Beer);
