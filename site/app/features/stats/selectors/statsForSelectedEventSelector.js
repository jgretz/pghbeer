import _ from 'lodash/fp';
import {createSelector} from 'reselect';
import reportStatsSelector from './reportStatsSelector';
import selectedEventSelector from '../../checklist/selectors/selectedEventSelector';

export default createSelector(
  reportStatsSelector,
  selectedEventSelector,
  (stats, selectedEvent) =>
    stats |> _.filter(s => s.event_id === selectedEvent),
);
