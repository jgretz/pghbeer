import React from 'react';
import {compose, withState, withCallback} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';

import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const Icon = ({classes, open, openModal, closeModal}) => (
  <>
    <IconButton className={classes.icon} onClick={openModal}>
      <InfoIcon />
    </IconButton>

    <Dialog
      open={open}
      onClose={closeModal}
      aria-labelledby="About Checklist"
      aria-describedby="A description about the page"
      PaperProps={{className: classes.modal}}
    >
      <Container className={classes.content}>
        <Typography variant="h5" className={classes.title}>
          Beers of the Burgh
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          className={classes.subtitle}
        >
          Beer List
        </Typography>
        <Typography variant="body1" className={classes.content}>
          Hi, my name is{' '}
          <a
            href="https://www.twitter.com/joshgretz"
            target="_blank"
            className={classes.contentLink}
          >
            Josh Gretz
          </a>{' '}
          and I have attended pretty much every{' '}
          <a
            href="http://www.beersoftheburgh.com"
            className={classes.contentLink}
          >
            Beers of the Burgh
          </a>{' '}
          event since the beginning.
        </Typography>
        <Typography variant="body1" className={classes.content}>
          I have always wanted to keep track of what I drink over the event, but
          that goal becomes increasingly difficult as the afternoon goes on and
          I normally give up about two hours in.
        </Typography>
        <Typography variant="body1" className={classes.content}>
          The organizers were kind enough to work with me to compile a list of
          most of the beers the breweries will be bringing so that I could
          create an easy to use website that I and others could use throughout
          the event.
        </Typography>
        <Typography variant="body1" className={classes.content}>
          This site saves your data locally on your device. It also anonymously
          sends the list of beers you drank to my server so I can have fun by
          looking at the aggregate data. To be clear, it does nothing to
          identify who you are. By using this site, you agree to the above use.
        </Typography>
      </Container>
    </Dialog>
  </>
);

export default compose(
  withState('open', 'setOpen', false),
  withCallback('openModal', ({setOpen}) => () => {
    setOpen(true);
  }),
  withCallback('closeModal', ({setOpen}) => () => {
    setOpen(false);
  }),

  withStyles(theme => ({
    icon: {
      padding: 0,
      margin: '12px 6px',
    },

    modal: {
      boxShadow: 'none',
    },
    content: {
      backgroundColor: theme.palette.primary.main,

      overflowX: 'hidden',
      textAlign: 'left',
      padding: 12,
    },

    title: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subtitle: {
      textAlign: 'center',
    },

    contentLink: {
      textDecoration: 'none',
      color: theme.palette.secondary.main,
    },
  })),
)(Icon);
