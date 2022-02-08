import React, {ChangeEvent, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import {Theme, alpha} from '@mui/material/styles';

import {
  AppBar,
  Button,
  Container,
  Dialog,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from '@mui/material';
import {GetApp, Info, Search} from '@mui/icons-material';
import {scroller} from 'react-scroll';

import BotbLogo from '../../../images/botb-logo.jpg';

import {setSearchTerm} from '../../data/actions';
import {jumpCategoriesSelector} from '../../data/selectors';

const useStyles = makeStyles((theme: Theme) => ({
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,

    height: 96,
    width: '100%',
  },
  toolbar: {
    padding: 0,
  },
  botbLogo: {
    marginTop: -5,
    marginLeft: '6px',
    height: 40,
  },

  // search
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },

    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    width: '100%',
  },

  searchIcon: {
    width: theme.spacing(4),
    height: '100%',

    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 5),
    transition: theme.transitions.create('width'),
  },

  // about
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

  // jump
  jumpIcon: {
    padding: 0,
    margin: '12px 6px',
  },

  jumpModal: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },

  jumpContent: {
    backgroundColor: 'transparent',

    overflowX: 'hidden',
    textAlign: 'center',
    margin: 'auto 12',
  },

  categoryButton: {
    fontSize: 30,
    width: 80,
    height: 80,

    margin: '0 6px 6px 6px',
    borderRadius: '50%',

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
  },
}));

const SearchBox = () => {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);

      dispatch(setSearchTerm(event.target.value));
    },
    [setSearch],
  );

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <Search />
      </div>

      <InputBase
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{'aria-label': 'search'}}
        onChange={handleChange}
        value={search}
      />
    </div>
  );
};

const AboutIcon = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      <IconButton className={classes.icon} onClick={openModal}>
        <Info />
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
          <Typography variant="h6" color="textSecondary" className={classes.subtitle}>
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
            <a href="http://www.beersoftheburgh.com" className={classes.contentLink}>
              Beers of the Burgh
            </a>{' '}
            event since the beginning.
          </Typography>
          <Typography variant="body1" className={classes.content}>
            I have always wanted to keep track of what I drink over the event, but that goal becomes
            increasingly difficult as the afternoon goes on and I normally give up about two hours
            in.
          </Typography>
          <Typography variant="body1" className={classes.content}>
            The organizers were kind enough to work with me to compile a list of most of the beers
            the breweries will be bringing so that I could create an easy to use website that I and
            others could use throughout the event.
          </Typography>
          <Typography variant="body1" className={classes.content}>
            This site saves your data locally on your device. It also anonymously sends the list of
            beers you drank to my server so I can have fun by looking at the aggregate data. To be
            clear, it does nothing to identify who you are. By using this site, you agree to the
            above use.
          </Typography>
        </Container>
      </Dialog>
    </>
  );
};

const JumpIcon = () => {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);

  const categories = useSelector(jumpCategoriesSelector);

  const handleCategoryClick = useCallback(
    (category: string) => () => {
      setOpen(false);

      scroller.scrollTo(category, {
        duration: 1200,
        delay: 100,
        smooth: true,
        offset: -90,
      });
    },
    [setOpen],
  );

  return (
    <>
      <IconButton className={classes.jumpIcon} onClick={openModal}>
        <GetApp />
      </IconButton>

      <Dialog
        open={open}
        onClose={closeModal}
        aria-labelledby="Jump To Category Dialog"
        aria-describedby="The list of categories, select one and you will jump to it"
        PaperProps={{className: classes.jumpModal}}
      >
        <div className={classes.jumpContent}>
          {categories.map((category) => (
            <Button
              key={category}
              className={classes.categoryButton}
              onClick={handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </Dialog>
    </>
  );
};

const Navigation = () => {
  const classes = useStyles();

  return (
    <div className={classes.nav}>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <img src={BotbLogo} className={classes.botbLogo} />

          <SearchBox />
          <JumpIcon />
          <AboutIcon />
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default Navigation;
