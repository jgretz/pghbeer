import React, {useCallback, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {format} from 'date-fns';

import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/material/styles';
import {Container, Dialog} from '@mui/material';

import {Event} from '../../data/Types';
import {activeEventSelector, eventsSelector} from '../../data/selectors';
import {loadData, setActiveEvent, setLoading} from '../../data/actions';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

interface EventProps {
  event: Event;
  closeModal: () => void;
}

// styles
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

  modal: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },

  modalContent: {
    backgroundColor: 'transparent',

    overflowX: 'hidden',
    textAlign: 'center',
    margin: 'auto 12',

    paddingTop: 12,

    display: 'flex',
    flexDirection: 'column',
  },

  modalButton: {
    width: 200,
    height: 80,

    margin: '0 6px 6px 6px',
    borderRadius: 8,

    backgroundColor: '#424242',

    '&:hover': {
      backgroundColor: '#424242',
      borderColor: '#000',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#424242',
      borderColor: '#000',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0, 0, 0, .5)',
    },

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  eventName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.palette.secondary.main,
  },

  eventDate: {
    fontSize: 12,
  },
}));

const formatEventDate = (date: Date) => format(date, 'MMMM d, yyyy');

const EventButton = ({event, closeModal}: EventProps) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    closeModal();

    dispatch(setActiveEvent(event));
    dispatch(loadData);
    dispatch(setLoading(true));
  }, [event, closeModal]);

  return (
    <div className={classes.modalButton} onClick={onClick}>
      <div className={classes.eventName}>{event.name}</div>
      <div className={classes.eventDate}>{formatEventDate(event.date)}</div>
    </div>
  );
};

const EventListDialog = ({isOpen, closeModal}: ModalProps) => {
  const classes = useStyles();
  const events = useSelector(eventsSelector);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="Event List"
        aria-describedby="the list of events held by the site with the ability to chose one to display"
        PaperProps={{className: classes.modal}}
      >
        <Container className={classes.modalContent}>
          {events.map((e) => (
            <EventButton key={e.id} event={e} closeModal={closeModal} />
          ))}
        </Container>
      </Dialog>
    </>
  );
};

const EventTitle = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);

  const event = useSelector(activeEventSelector);
  const date = useMemo(() => formatEventDate(event.date), [event]);

  return (
    <>
      <div className={classes.eventTitleRoot} onClick={openModal}>
        <div className={classes.eventTitleContainer}>
          <h2 className={classes.eventTitleName}>{event.name}</h2>
          <h3 className={classes.eventTitleDate}>{date}</h3>
        </div>
      </div>

      <EventListDialog isOpen={open} closeModal={closeModal} />
    </>
  );
};

export default EventTitle;
