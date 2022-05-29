import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/material/styles';
import {IconButton} from '@mui/material';
import {ThumbUp, ThumbDown} from '@mui/icons-material';

import {BeerDetail, StatOpinion} from '../../data/Types';
import {activeEventSelector, activeUserSelector} from '../../data/selectors';

import {recordOpinion, removeOpinion} from '../../data/actions';

interface Props {
  beer: BeerDetail;
}

const useStyles = makeStyles((theme: Theme) => ({
  beerContainer: {
    marginTop: 10,

    display: 'flex',
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'flex-start',

    maxWidth: '100hw',
    overflow: 'hidden',
  },
  checkContainer: {
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '50%',

    height: 75,
    width: 75,
    minWidth: 75,

    backgroundColor: theme.palette.primary.main,
  },
  detailContainer: {
    flexGrow: 1,

    marginLeft: -15,
    padding: '5px 5px 5px 10px',
    height: 60,

    overflow: 'hidden',

    backgroundColor: theme.palette.primary.main,
  },

  name: {
    flex: 1,
    minWidth: 0,

    fontSize: '1.3em',
    fontWeight: 'bold',

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  detail: {
    flex: 1,
    minWidth: 0,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
}));

const CheckboxNotDrank = ({beer}: Props) => {
  const classes = useStyles();

  const user = useSelector(activeUserSelector);
  const event = useSelector(activeEventSelector);
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch(recordOpinion(user, event, beer, StatOpinion.Unknown));
  }, [beer, user, event]);

  return <div className={classes.checkboxCircle} onClick={handleClick} />;
};

const CheckboxUnknown = ({beer}: Props) => {
  const classes = useStyles();

  const user = useSelector(activeUserSelector);
  const event = useSelector(activeEventSelector);
  const dispatch = useDispatch();

  const handleLikeClick = useCallback(() => {
    dispatch(recordOpinion(user, event, beer, StatOpinion.Like));
  }, [beer, user, event]);

  const handleDislikeClick = useCallback(() => {
    dispatch(recordOpinion(user, event, beer, StatOpinion.Dislike));
  }, [beer, user, event]);

  return (
    <div>
      <IconButton className={classes.likeButton} onClick={handleLikeClick}>
        <ThumbUp />
      </IconButton>
      <IconButton className={classes.dislikeButton} onClick={handleDislikeClick}>
        <ThumbDown />
      </IconButton>
    </div>
  );
};

const CheckboxLike = ({beer}: Props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    dispatch(removeOpinion(beer));
  }, [beer]);

  return (
    <div className={classes.checkboxCircle} onClick={handleClick}>
      <IconButton onClick={handleClick}>
        <ThumbUp color="secondary" />
      </IconButton>
    </div>
  );
};

const CheckboxDislike = ({beer}: Props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    dispatch(removeOpinion(beer));
  }, [beer]);

  return (
    <div className={classes.checkboxCircle} onClick={handleClick}>
      <IconButton onClick={handleClick}>
        <ThumbDown color="secondary" />
      </IconButton>
    </div>
  );
};

const BeerCardCheckboxMap = {
  [StatOpinion.Unknown]: CheckboxUnknown,
  [StatOpinion.Like]: CheckboxLike,
  [StatOpinion.Dislike]: CheckboxDislike,
};

const BeerCardCheckbox = ({beer}: Props) => {
  const classes = useStyles();
  const Component = useMemo(
    () => (beer.opinion ? BeerCardCheckboxMap[beer.opinion.opinion] : CheckboxNotDrank),
    [beer.opinion?.opinion],
  );

  return (
    <div className={classes.checkContainer}>
      <Component beer={beer} />
    </div>
  );
};

const BeerCardDetail = ({beer}: Props) => {
  const classes = useStyles();
  const detail = useMemo(
    () => `${beer.style.name} ${beer.beer.abv ? `| ${beer.beer.abv}%` : ''}`,
    [beer],
  );

  return (
    <div className={classes.detailContainer}>
      <div className={classes.name}>
        <span>{beer.beer.name}</span>
      </div>
      <div className={classes.detail}>
        <span>{detail}</span>
      </div>
    </div>
  );
};

const BeerCard = ({beer}: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.beerContainer}>
      <BeerCardCheckbox beer={beer} />
      <BeerCardDetail beer={beer} />
    </div>
  );
};

export default BeerCard;
