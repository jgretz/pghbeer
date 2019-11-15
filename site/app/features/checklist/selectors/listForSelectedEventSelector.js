import _ from 'lodash/fp';
import {createSelector} from 'reselect';

import selectedEventSelector from './selectedEventSelector';
import {beersForEventsSelector} from '../../events/selectors';
import {beersSelector} from '../../beers/selectors';
import {breweriesSelector} from '../../breweries/selectors';
import {stylesSelector} from '../../styles/selectors';
import {statsForActiveUserSelector} from '../../stats/selectors';
import {searchSelector} from '../../navigation/selectors';

const searchFilter = search => beer => {
  if (search.length === 0) {
    return true;
  }

  const searchToken = search.toLowerCase();

  return (
    beer.name.toLowerCase().includes(searchToken) ||
    beer.brewery?.name.toLowerCase().includes(searchToken) ||
    beer.style?.name.toLowerCase().includes(searchToken)
  );
};

export default createSelector(
  selectedEventSelector,
  beersForEventsSelector,
  beersSelector,
  breweriesSelector,
  stylesSelector,
  statsForActiveUserSelector,
  searchSelector,

  (selectedEvent, beersForEvents, beers, breweries, styles, stats, search) => {
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
      |> _.filter(searchFilter(search))
      |> _.sortBy(x => x.name)
      |> _.groupBy(x => x.brewery.name)
    );
  },
);
