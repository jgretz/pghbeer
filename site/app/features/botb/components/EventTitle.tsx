import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {format} from 'date-fns';
import {activeEventSelector} from '../../data/selectors';

import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  eventTitleRoot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    color: theme.palette.secondary.main,
    backgroundColor: 'rgba(0, 0, 0, .7)',
    borderRadius: '8px',
  },

  eventTitleContainer: {
    marginLeft: 8,
    marginRight: 8,
  },
  eventTitleName: {
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  eventTitleDate: {
    marginTop: 0,
    marginBottom: 8,
    textAlign: 'center',
  },
}));

const EventTitle = () => {
  const styles = useStyles();

  const event = useSelector(activeEventSelector);
  const date = useMemo(() => format(event.date, 'MMMM d, yyyy'), [event]);

  return (
    <div className={styles.eventTitleRoot}>
      <div className={styles.eventTitleContainer}>
        <h2 className={styles.eventTitleName}>{event.name}</h2>
        <h3 className={styles.eventTitleDate}>{date}</h3>
      </div>
    </div>
  );
};

export default EventTitle;
