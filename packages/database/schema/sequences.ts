import {pgSequence} from 'drizzle-orm/pg-core';

export const beersIdSeq = pgSequence('beers_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const breweriesIdSeq = pgSequence('breweries_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const eventbeerlistIdSeq = pgSequence('eventbeerlist_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const eventsIdSeq = pgSequence('events_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const statsIdSeq = pgSequence('stats_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const stylesIdSeq = pgSequence('styles_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});

export const usersIdSeq = pgSequence('users_id_seq', {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: '9223372036854775807',
  cache: 1,
  cycle: false,
});
