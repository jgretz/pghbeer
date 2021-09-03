import _ from 'lodash/fp';
import {get, post, configureHttp} from '@truefit/http-utils';
import Beerset from '../../data/botb2021.5.json';

configureHttp({
  baseConfig: {
    baseURL: 'http://localhost:3000/api',
  },
  baseHeaders: {
    auth_key:
      'ykE^WULrJczXdT*PDEgpSHqh0blfPR6pbzQG7q^t!3$4ic38tfJg4&9quqZI%cWA9oc1G&vrcXZBW6qMlxEBi^$Jf9X4drCL',
  },
});

const TEST = false;

const event_id = 2;

const prepData = async () => {
  const beers = await get('beers');
  const breweries = await get('breweries');
  const styles = await get('styles');

  return {beers: beers.data, breweries: breweries.data, styles: styles.data};
};

const uploadBeer = database => async beer => {
  console.log(beer);
  let brewery =
    database.breweries
    |> _.find(b => b.name.toLowerCase() === beer.brewery.toLowerCase());

  if (!brewery) {
    if (TEST) {
      console.log('Brewery', beer);
      return;
    }

    const response = await post('breweries', {name: beer.brewery});
    brewery = response.data;
    database.breweries.push(brewery);

    console.log(`Added Brewery - ${brewery.name}`);
  }

  let style =
    database.styles
    |> _.find(s => s.name.toLowerCase() === beer.style.toLowerCase());

  if (!style) {
    if (TEST) {
      console.log('Style', beer);
      return;
    }

    const response = await post('styles', {name: beer.style});
    style = response.data;
    database.styles.push(style);

    console.log(`Added Style - ${style.name}`);
  }

  if (!beer.name) {
    console.log(beer);
  }

  let databaseBeer =
    database.beers
    |> _.find(
      b =>
        b.name.toLowerCase() === beer.name.toLowerCase() &&
        b.brewery_id === brewery.id,
    );

  if (!databaseBeer) {
    if (TEST) {
      console.log('Beer', beer);
      return;
    }

    const response = await post('beers', {
      name: beer.name,
      abv: beer.abv,

      style_id: style.id,
      brewery_id: brewery.id,
    });

    databaseBeer = response.data;

    console.log(`Added Beer - ${beer.name}`);
  }

  if (TEST) {
    return;
  }

  await post('eventbeerlist', {event_id, beer_id: databaseBeer.id});
};

const uploadBrewery = async brewery => {
  const response = await post('breweries', {name: brewery});

  console.log(`Added Brewery - ${brewery}`);
};

export default async () => {
  const database = await prepData();
  for (const beer of Beerset) {
    await uploadBeer(database)(beer);
  }
};
