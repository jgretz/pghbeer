import _ from 'lodash';
import {ApplicationState} from 'rootReducer';
import {Beer, BeerDetail, BeerStyle, Brewery} from '../Types';

const doesBeerPassSearchFilter = (
  beer: Beer,
  brewery: Brewery,
  style: BeerStyle,
  searchFilter: string,
) => {
  if (searchFilter.length === 0) {
    return true;
  }

  const searchToken = searchFilter.toLowerCase();

  return (
    beer.name.toLowerCase().includes(searchToken) ||
    brewery.name.toLowerCase().includes(searchToken) ||
    style.name.toLowerCase().includes(searchToken)
  );
};

export default (state: ApplicationState) => {
  const {activeEvent, activeUser, breweries, beers, styles, searchTerm} = state.features.data;

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

      if (!doesBeerPassSearchFilter(beer, brewery, style, searchTerm)) {
        return null;
      }

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
