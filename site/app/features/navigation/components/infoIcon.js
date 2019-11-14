import React from 'react';
import {compose} from '@truefit/bach';

import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

const Icon = () => (
  <IconButton>
    <InfoIcon />
  </IconButton>
);

export default compose()(Icon);
