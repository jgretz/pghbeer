import _ from 'lodash/fp';
import {matches} from 'z';
import {configureHttp, get, post} from '@truefit/http-utils';
import data from '../data/data.json';
import generateNewVariableName from './generateNewVariableName';

configureHttp({
  baseConfig: {
    baseURL: 'http://localhost:3000',
  },
});

const newId = generateNewVariableName();

const mapWithIndex = _.map.convert({cap: false});
const identity = x => x;

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
    id: newId(),
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
    id: newId(),
    name,
  };
};

const importBreweries = () =>
  data.beers |> _.map(b => b.brewery) |> _.uniq |> mapWithIndex(breweryPrep);

// beers //
const beerPrep = (styles, breweries) => b => {
  const beer = {
    id: newId(),
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
  id: newId(),
  name: 'anonymous',
  webuserid,
});

const importUsers = () =>
  data.stats |> _.map(s => s.webuserid) |> _.uniq |> mapWithIndex(prepUser);

// summer history //
const prepStat = (beers, users, events) => s => {
  const stat = {
    id: newId(),
    date: s.checkdate,
    opinion: 0, // unknown
  };

  const beer = _.find(
    x => x.beer.name === s.beer && x.brewery.name === s.brewery,
  )(beers);
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
    id: '1',
    name: 'Beers of the Burgh - Summer 2019',
    date: new Date(2019, 6, 14),
  },
  {
    id: '2',
    name: 'Beers of the Burgh - Winter 2019',
    date: new Date(2019, 11, 2),
  },
];

const importStats = (beers, users, events) =>
  data.stats |> _.map(prepStat(beers, users, events));

// upload
const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

let count = 0;
const uploadAll = async (route, arr, map) => {
  for (const obj of arr.map(map)) {
    await post(route, obj);
    await sleep(300); // attempting to keep going and not hit the azure rate limit

    console.log(`Uploaded ${obj.id || count++} to ${route}`);
  }
};

const relateBeers = async beers => {
  for (const b of beers) {
    const {beer, style, brewery} = b;

    if (!beer) {
      continue;
    }

    if (style) {
      await post('edge', {
        label: 'hasStyle',
        from: {
          v: 'beer',
          properties: {name: beer.name},
        },
        to: {
          v: 'style',
          properties: {name: style.name},
        },
      });

      console.log(`Related beer ${beer.name} to style ${style.name}`);
    }

    if (brewery) {
      await post('edge', {
        label: 'craftedBy',
        from: {
          v: 'beer',
          properties: {name: beer.name},
        },
        to: {
          v: 'brewery',
          properties: {name: brewery.name},
        },
      });

      console.log(`Related beer ${beer.name} to brewery ${brewery.name}`);
    }
  }
};

const uploadStats = async stats => {
  for (const s of stats) {
    const {stat, beer, user, event} = s;

    if (!beer || !user || !event) {
      continue;
    }

    await post('stats', stat);

    await post('edge', {
      label: 'drank',
      from: {
        v: 'stat',
        properties: {id: stat.id},
      },
      to: {
        v: 'beer',
        properties: {name: beer.name},
      },
    });

    await post('edge', {
      label: 'at',
      from: {
        v: 'stat',
        properties: {id: stat.id},
      },
      to: {
        v: 'event',
        properties: {name: event.name},
      },
    });

    await post('edge', {
      label: 'by',
      from: {
        v: 'stat',
        properties: {id: stat.id},
      },
      to: {
        v: 'user',
        properties: {webuserid: user.webuserid},
      },
    });

    console.log(`Recorded stat - ${stat.id}`);

    await sleep(300); // attempting to keep going and not hit the azure rate limit
  }
};

// logic
const main = async () => {
  try {
    const styles = importStyles();
    const breweries = importBreweries();
    const beers = importBeers(styles, breweries);
    const users = importUsers();
    const events = importEvents();
    const stats = importStats(beers, users, events);

    // await uploadAll('styles', styles, identity);
    // await uploadAll('breweries', breweries, identity);
    // await uploadAll('beers', beers, x => x.beer);
    // await relateBeers(beers);

    // await uploadAll('users', users, identity);
    // await uploadAll('events', events, identity);

    stats.splice(0, 4367);

    await uploadStats(stats);
  } catch (err) {
    console.error(err); // eslint-disable-line
  }
};

main();
