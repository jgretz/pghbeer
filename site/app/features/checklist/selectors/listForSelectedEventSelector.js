import _ from 'lodash/fp';
import {createSelector} from 'reselect';

import selectedEventSelector from './selectedEventSelector';
import {beersForEventsSelector} from '../../events/selectors';
import {beersSelector} from '../../beers/selectors';
import {breweriesSelector} from '../../breweries/selectors';
import {stylesSelector} from '../../styles/selectors';
import {statsForActiveUserSelector} from '../../stats/selectors';

export default createSelector(
  selectedEventSelector,
  beersForEventsSelector,
  beersSelector,
  breweriesSelector,
  stylesSelector,
  statsForActiveUserSelector,
  (selectedEvent, beersForEvents, beers, breweries, styles, stats) => {
    if (beers.length === 0 || breweries.length === 0 || styles.length === 0) {
      return [];
    }

    return (
      beersForEvents
      |> _.filter(x => x.event_id === selectedEvent)
      |> _.map(x => _.find(y => y.id === x.beer_id)(beers))
      |> _.filter(x => x)
      |> _.map(x => ({
        ...x,
        style: _.find(y => y.id === x.style_id)(styles),
        brewery: _.find(y => y.id === x.brewery_id)(breweries),
        stat: _.find(y => y.beer_id === x.id && y.event_id === selectedEvent)(
          stats,
        ),
      }))
      |> _.sortBy(x => x.name)
      |> _.groupBy(x => x.brewery.name)
    );
  },
);