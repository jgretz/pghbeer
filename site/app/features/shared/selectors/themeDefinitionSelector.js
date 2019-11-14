import {createSelector} from 'reselect';
import {THEME_DEFINITIONS} from '../../../styles/themes';
import themeSelector from './themeSelector';

export default createSelector(themeSelector, theme => THEME_DEFINITIONS[theme]);
