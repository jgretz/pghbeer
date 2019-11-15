import React from 'react';
import {compose, withState, withCallback} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';
import {withSelector} from '@truefit/bach-redux';
import {scroller} from 'react-scroll';

import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';

import {jumpCategoriesSelector} from '../../checklist/selectors';

const Icon = ({
  classes,
  open,

  categories,
  handleCategoryClick,

  openModal,
  closeModal,
}) => (
  <>
    <IconButton className={classes.icon} onClick={openModal}>
      <GetAppIcon />
    </IconButton>

    <Dialog
      open={open}
      onClose={closeModal}
      aria-labelledby="Jump To Category Dialog"
      aria-describedby="The list of categories, select one and you will jump to it"
      PaperProps={{className: classes.modal}}
    >
      <div className={classes.content}>
        {categories.map(category => (
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

export default compose(
  withSelector('categories', jumpCategoriesSelector),

  withState('open', 'setOpen', false),
  withCallback('openModal', ({setOpen}) => () => {
    setOpen(true);
  }),
  withCallback('closeModal', ({setOpen}) => () => {
    setOpen(false);
  }),
  withCallback('handleCategoryClick', ({setOpen}) => category => () => {
    setOpen(false);

    scroller.scrollTo(category, {
      duration: 1200,
      delay: 100,
      smooth: true,
      offset: -90,
    });
  }),

  withStyles({
    icon: {
      padding: 0,
      margin: '12px 6px',
    },

    modal: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    content: {
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
  }),
)(Icon);
