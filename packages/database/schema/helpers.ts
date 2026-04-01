import {pgEnum, timestamp} from 'drizzle-orm/pg-core';

export const beverageTypeEnum = pgEnum('beverage_type', [
  'beer',
  'wine',
  'mead',
  'cocktail',
  'cider',
  'seltzer',
  'hard_tea',
]);
export type BeverageType = (typeof beverageTypeEnum.enumValues)[number];

export const dates = {
  createDate: timestamp('create_date').notNull(),
  updateDate: timestamp('update_date').notNull(),
};
