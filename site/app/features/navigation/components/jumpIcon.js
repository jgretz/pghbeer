import React from 'react';
import {compose} from '@truefit/bach';

import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';

const Icon = () => (
  <IconButton>
    <GetAppIcon />
  </IconButton>
);

export default compose()(Icon);
