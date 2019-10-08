import React from 'react';
import {Switch, Route} from 'react-router';

import {Landing} from '../../landing/components';
import NotFound from './notFound';

export default () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route component={NotFound} />
  </Switch>
);
