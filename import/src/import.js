import _ from 'lodash/fp';
import {matches} from 'z';
import {configureHttp, get, post} from '@truefit/http-utils';
import data from '../data/data.json';
import generateNewVariableName from './generateNewVariableName';

configureHttp({
  baseConfig: {
    baseURL: 'http://localhost:3000',
  },
  baseHeaders: {
    auth_key:
      'ykE^WULrJczXdT*PDEgpSHqh0blfPR6pbzQG7q^t!3$4ic38tfJg4&9quqZI%cWA9oc1G&vrcXZBW6qMlxEBi^$Jf9X4drCL',
  },
});

const identity = x => x;

const results = {};
const postArray = async (route, data) => {
  for (const item of data) {
    const response = await post(`api/${route}`, item);

    item.id = response.data.id;

    console.log(`Posted to ${route} with id of ${item.id} named ${item.name}`);
  }

  results[route] = data;
};

// styles //
const styleFilter = s => s && !s.includes('%') && !s.includes('TBD');
const parseStyleName = s => {
  const name = matches(s)(
    (s = null) => '',
    (s = 'PA v1.0') => 'IPA',
    (s = /\u002E\u002E\u002E/g) => _.truncate()(s),
    (s = /\u002E\d/g) => s.split(' ')[0],
    s => s,
  );

  return {name};
};

const importStyles = async () => {
  const styles =
    data.beers
    |> _.map(b => b.type)
    |> _.uniq
    |> _.filter(styleFilter)
    |> _.map(parseStyleName);

  styles.push({name: 'Unknown'});

  await postArray('styles', styles);
};

// breweries //
const parseBreweryName = b => {
  const name = matches(b)(
    (s = null) => '',
    (s = /[’]/) => s.replace(/[’]/, "'"),
    s => s,
  );

  return {name};
};

const importBreweries = async () => {
  const breweries =
    data.beers |> _.map(b => b.brewery) |> _.uniq |> _.map(parseBreweryName);

  await postArray('breweries', breweries);
};

// beers //
const parseAbv = abv => parseFloat(abv.replace('%', ''));

const fillBeer = b => {
  const style =
    _.find(x => x.name === parseStyleName(b.type).name)(results.styles) ||
    _.find(x => x.name === 'Unknown')(results.styles);

  const brewery = _.find(x => x.name === parseBreweryName(b.brewery).name)(
    results.breweries,
  );

  return {
    name: b.name,
    abv: b.abv ? parseAbv(b.abv) : null,
    style_id: style.id,
    brewery_id: brewery.id,
  };
};

const importBeers = async () => {
  const beers = data.beers |> _.map(fillBeer);

  await postArray('beers', beers);
};

// users //
const fillUser = webuserid => ({
  name: 'anonymous',
  webuserid,
});

const importUsers = async () => {
  const users =
    data.stats
    |> _.map(s => s.webuserid)
    |> _.uniq
    |> _.filter(identity)
    |> _.map(fillUser);

  await postArray('users', users);
};

// events //
const importEvents = async () => {
  const events = [
    {
      name: 'Beers of the Burgh - Summer 2019',
      date: new Date(2019, 6, 14),
    },
    {
      name: 'Beers of the Burgh - Winter 2019',
      date: new Date(2019, 11, 2),
    },
  ];

  await postArray('events', events);
};

// summer history //
const fillStat = s => {
  const beer = _.find(x => x.name === s.beer)(results.beers);
  const user = _.find(x => x.webuserid === s.webuserid)(results.users);
  const event = results.events[0];

  return {
    date: s.checkdate,
    opinion: 0, // unknown
    beer_id: beer.id,
    user_id: user.id,
    event_id: event.id,
  };
};

const importStats = async () => {
  const stats = data.stats |> _.map(fillStat);

  await postArray('stats', stats);
};

// logic
const main = async () => {
  try {
    await importStyles();
    await importBreweries();
    await importBeers();

    await importEvents();
    await importUsers();

    await importStats();
  } catch (err) {
    console.error(err); // eslint-disable-line
  }
};

main();
