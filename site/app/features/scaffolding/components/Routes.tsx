import React from 'react';
import {Routes, Route} from 'react-router';
import {Landing} from '../../botb/components';
import {NotFound} from '../../shared/components';

export default () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
