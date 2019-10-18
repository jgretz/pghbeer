import _ from 'lodash/fp';
import {matches} from 'z';
import {configureHttp, get, post} from '@truefit/http-utils';
import data from '../data/data.json';

configureHttp({
  baseConfig: {
    baseURL: 'http://localhost:3000',
  },
});

const mapWithIndex = _.map.convert({cap: false});

// styles //
const styleFilter = s => s && !s.includes('%') && !s.includes('TBD');

const stylePrep = (s, index) => {
  const name = matches(s)(
    (s = null) => '',
    (s = 'PA v1.0') => 'IPA',
    (s = /\u002E\u002E\u002E/g) => _.truncate()(s),
    (s = /\u002E\d/g) => s.split(' ')[0],
    s => s,
  );

  return {
    id: index,
    name,
  };
};

const importStyles = () =>
  data.beers
  |> _.map(b => b.type)
  |> _.uniq
  |> _.filter(styleFilter)
  |> mapWithIndex(stylePrep);

// breweries //
const breweryPrep = (b, index) => {
  const name = matches(b)(
    (s = null) => '',
    (s = /[’]/) => s.replace(/[’]/, "'"),
    s => s,
  );

  return {
    id: index,
    name,
  };
};

const importBreweries = () =>
  data.beers |> _.map(b => b.brewery) |> _.uniq |> mapWithIndex(breweryPrep);

// beers //
const beerPrep = (styles, breweries) => b => {
  const beer = {
    id: b.id,
    name: b.name,
    abv: b.abv,
  };

  const style = _.find(x => x.name === stylePrep(b.type).name)(styles);
  const brewery = _.find(x => x.name === breweryPrep(b.brewery).name)(
    breweries,
  );

  return {
    beer,
    style,
    brewery,
  };
};

const importBeers = (styles, breweries) =>
  data.beers |> _.map(beerPrep(styles, breweries));

// users //
const prepUser = (webuserid, index) => ({
  id: index,
  name: 'anonymous',
  webuserid,
});

const importUsers = () =>
  data.stats |> _.map(s => s.webuserid) |> _.uniq |> mapWithIndex(prepUser);

// summer history //
const prepStat = (beers, users, events) => s => {
  const stat = {
    date: s.checkdate,
    opinion: 0, // unknown
  };

  const beer = _.find(x => x.id === s.beer.beerid)(beers);
  const user = _.find(x => x.webuserid === s.webuserid)(users);
  const event = events[0];

  return {
    stat,
    beer,
    user,
    event,
  };
};

const importEvents = () => [
  {
    id: 1,
    name: 'Beers of the Burgh - Summer 2019',
    date: new Date(2019, 6, 14),
  },
  {
    id: 2,
    name: 'Beers of the Burgh - Winter 2019',
    date: new Date(2019, 11, 2),
  },
];

const importStats = (beers, users, events) =>
  data.stats |> _.map(prepStat(beers, users, events));

// logic
const main = async () => {
  try {
    const styles = importStyles();
    const breweries = importBreweries();
    const beers = importBeers(styles, breweries);
    const users = importUsers();
    const events = importEvents();
    const stats = importStats(beers, users, events);
  } catch (err) {
    console.error(err); // eslint-disable-line
  }
};

main();
