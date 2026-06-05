import {beforeEach, describe, expect, it} from 'bun:test';

import {
  addBeerToEvent,
  createBeer,
  createBrewery,
  createEvent,
  createStyle,
  listBeersForEvent,
  removeBeerFromEvent,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

async function seed() {
  const brewery = await createBrewery({name: 'Dancing Gnome'});
  const style = await createStyle({name: 'IPA'});
  const beer = await createBeer({
    name: 'Lustra',
    abv: 5.0,
    beverageType: 'beer',
    isNa: false,
    breweryId: brewery.id,
    styleId: style.id,
  });
  const event = await createEvent({name: 'BOTB 2026', date: '2026-04-18'});
  return {brewery, style, beer, event};
}

beforeEach(async function () {
  await setupTestDb();
});

describe('addBeerToEvent', function () {
  it('should be idempotent — re-adding the same beer yields one link', async function () {
    const {beer, event} = await seed();

    await addBeerToEvent(event.id, beer.id);
    await addBeerToEvent(event.id, beer.id);

    expect(await listBeersForEvent(event.id)).toHaveLength(1);
  });
});

describe('listBeersForEvent', function () {
  it('should return only beers linked to the event in the joined shape', async function () {
    const {brewery, style, beer, event} = await seed();
    await addBeerToEvent(event.id, beer.id);

    const [item] = await listBeersForEvent(event.id);

    expect(item).toMatchObject({
      id: beer.id,
      name: 'Lustra',
      brewery: {id: brewery.id, name: 'Dancing Gnome'},
      style: {id: style.id, name: 'IPA'},
    });
  });

  it('should not return beers from other events', async function () {
    const {beer, event} = await seed();
    const other = await createEvent({name: 'Other', date: '2026-09-01'});
    await addBeerToEvent(event.id, beer.id);

    expect(await listBeersForEvent(other.id)).toHaveLength(0);
  });
});

describe('removeBeerFromEvent', function () {
  it('should delete the link row', async function () {
    const {beer, event} = await seed();
    await addBeerToEvent(event.id, beer.id);

    await removeBeerFromEvent(event.id, beer.id);

    expect(await listBeersForEvent(event.id)).toHaveLength(0);
  });
});
