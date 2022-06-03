import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import Background from '../../../images/pghbackground.jpg';

import {loadData} from '../../data/actions';
import Navigation from './Navigation';
import List from './List';

const useStyles = makeStyles(() => ({
  page: {
    minHeight: '100vh',
    minWidth: '100hw',

    height: '100%',
    width: '100%',

    backgroundAttachment: 'fixed',
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    backgroundImage: `url(${Background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  container: {
    padding: '90px 10px 20px 10px',

    margin: '0 auto',
    maxWidth: '1200px',
  },
}));

const Landing = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadData);
  }, []);

  useEffect(() => {
    // i wanted to use react-helmet, but it still uses componentWillMount
    document.title = 'Beers of the Burgh';
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Navigation />

      <div className={classes.container}>
        <List />
      </div>
    </div>
  );
};

export default Landing;
