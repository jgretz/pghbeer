import React from 'react';
import {Switch, Route} from 'react-router';

import {Landing} from '../../landing/components';
import {Checklist} from '../../checklist/components';
import {Stats} from '../../stats/components';
import NotFound from './notFound';

export default () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route path="/checklist" component={Checklist} />
    <Route path="/stats" component={Stats} />

    <Route component={NotFound} />
  </Switch>
);
