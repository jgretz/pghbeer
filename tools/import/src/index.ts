import {PrismaClient, beers, breweries, styles} from '@prisma/client';
import * as data from './data/2024/load5.json';

interface LoadData {
  brewery: string;
  name: string;
  style: string;
  abv: number;
}

const EVENT_ID = 6;
const prisma = new PrismaClient();

// breweries
async function findBrewery(name: string) {
  let brewery = await prisma.breweries.findFirst({
    where: {
      name,
    },
  });

  if (!brewery) {
    brewery = await prisma.breweries.create({
      data: {
        name,
        create_date: new Date(),
        update_date: new Date(),
      },
    });

    console.log(name);
  }

  return brewery;
}

async function findStyle(name: string) {
  let style = await prisma.styles.findFirst({
    where: {
      name,
    },
  });

  if (!style) {
    style = await prisma.styles.create({
      data: {
        name,
        create_date: new Date(),
        update_date: new Date(),
      },
    });

    console.log(name);
  }

  return style;
}

async function findBeer(name: string, abv: number, brewery: breweries, style: styles) {
  let beer = await prisma.beers.findFirst({
    where: {
      name,
      brewery_id: brewery.id,
      style_id: style.id,
    },
  });

  if (!beer) {
    beer = await prisma.beers.create({
      data: {
        name,
        abv,
        brewery_id: brewery.id,
        style_id: style.id,
        create_date: new Date(),
        update_date: new Date(),
      },
    });

    console.log(name);
  }

  return beer;
}

async function ensureBeerAtEvent(beer: beers, event_id: number) {
  const beerEvent = await prisma.eventbeerlist.findFirst({
    where: {
      beer_id: beer.id,
      event_id,
    },
  });

  if (!beerEvent) {
    await prisma.eventbeerlist.create({
      data: {
        beer_id: beer.id,
        event_id,
        create_date: new Date(),
        update_date: new Date(),
      },
    });

    console.log(beer.name);
  }
}

async function main() {
  for (const d of data) {
    const brewery = await findBrewery(d.brewery);
    const style = await findStyle(d.style);

    if (!brewery || !style) {
      console.log(`Something weird with ${d.name}`);
      continue;
    }

    const beer = await findBeer(d.name, d.abv, brewery, style);

    await ensureBeerAtEvent(beer, EVENT_ID);
  }
}

main();
