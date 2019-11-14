import {createMuiTheme} from '@material-ui/core/styles';

const botbSummer = createMuiTheme({
  palette: {
    type: 'dark',
    background: {main: '#000'},
    primary: {main: '#c83228'},
    secondary: {main: '#ffc217'},
    tertiary: {main: '#f7f0d4'},
  },
});

const botbWinter = createMuiTheme({
  palette: {
    type: 'dark',
    background: {main: '#040f1c'},
    primary: {main: '#073757'},
    secondary: {main: '#1f85b4'},
    tertiary: {main: '#1D4A71'},
  },
});

export const THEMES = {
  BOTB_SUMMER: 'BOTB_SUMMER',
  BOTB_WINTER: 'BOTB_WINTER',
};

export const THEME_DEFINITIONS = {
  [THEMES.BOTB_SUMMER]: botbSummer,
  [THEMES.BOTB_WINTER]: botbWinter,
};
