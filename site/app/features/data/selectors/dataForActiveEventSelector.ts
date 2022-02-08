import _ from 'lodash';
import {ApplicationState} from 'rootReducer';
import {BeerDetail} from '../Types';

export default (state: ApplicationState) => {
  const {activeEvent, activeUser, breweries, beers, styles} = state.features.data;

  const detailData = activeEvent.beers
    .map((beerListItem) => {
      const beer = _.find(beers, (b) => b.id === beerListItem.beer_id);
      if (!beer) {
        return null;
      }

      const brewery = _.find(breweries, (b) => b.id === beer.brewery_id);
      const style = _.find(styles, (s) => s.id === beer.style_id);
      const opinion = _.find(
        activeUser.stats,
        (s) => s.beer_id === beer.id && s.event_id === beerListItem.event_id,
      );

      return {
        brewery,
        beer,
        style,
        opinion,
      } as BeerDetail;
    })
    .filter((x) => x);

  const groups = _.groupBy(detailData, (x) => x.brewery.name);

  const groupData = Object.keys(groups).map((name) => ({
    name,
    detail: groups[name],
  }));

  const sorted = _.sortBy(groupData, (x) => x.name);

  return sorted;
};
