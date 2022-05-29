// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { DataSource } from 'typeorm';

import { Beers, Breweries, Eventbeerlist, Events, Styles } from './entities';
import {
  syncBeers,
  syncBreweries,
  syncEventBeerListItems,
  syncStyles,
} from './services';

import importData from '../data/2022-summer-1';

// database
const connectToDatabase = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [Beers, Breweries, Eventbeerlist, Events, Styles],
  });

  await dataSource.initialize();

  return dataSource;
};

// main loop
const main = async () => {
  const dataSource = await connectToDatabase();
  try {
    const breweries = await syncBreweries(importData, dataSource);
    const styles = await syncStyles(importData, dataSource);
    const beers = await syncBeers(importData, dataSource, breweries, styles);

    await syncEventBeerListItems(importData, dataSource, beers, breweries);
  } catch (err) {
    console.log(err);
  } finally {
    await dataSource.destroy();
  }
};
main();
