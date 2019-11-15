import React from 'react';
import {compose} from '@truefit/bach';
import {withStyles} from '@truefit/bach-material-ui';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';

const Icon = ({classes}) => (
  <IconButton className={classes.icon}>
    <GetAppIcon />
  </IconButton>
);

export default compose(
  withStyles({
    icon: {
      padding: 0,
      margin: '12px 6px',
    },
  }),
)(Icon);
