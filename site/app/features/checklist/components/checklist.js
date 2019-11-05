import React from 'react';
import {compose, withEffect} from '@truefit/bach';
import {withActions} from '@truefit/bach-redux';

import {loadBeersFromServer} from '../../beers/actions';

const Checklist = () => (
  <div>Beers of the Burgh Winter Warmer list coming soon !!!</div>
);

export default compose(
  withActions({loadBeersFromServer}),

  withEffect(({loadBeersFromServer}) => {
    loadBeersFromServer();
  }, []),
)(Checklist);
