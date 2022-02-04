import React from 'react';
import {ThemeProvider, StyledEngineProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Routes from './Routes';
import theme from '../../../styles/theme';

const App = () => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes />
    </ThemeProvider>
  </StyledEngineProvider>
);

export default App;
