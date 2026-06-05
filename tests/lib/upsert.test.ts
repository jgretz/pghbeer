import {describe, expect, it} from 'bun:test';

import {beerNeedsUpdate, type BeerFields} from '../../scripts/lib/upsert.ts';

const base: BeerFields = {abv: 5.5, styleId: 3, isNa: false, beverageType: 'beer'};

describe('beerNeedsUpdate', () => {
  it('should be false when fields are identical', () => {
    expect(beerNeedsUpdate(base, {...base})).toBe(false);
  });

  it('should be true when abv changes (incl. null transitions)', () => {
    expect(beerNeedsUpdate(base, {...base, abv: 5.8})).toBe(true);
    expect(beerNeedsUpdate({...base, abv: null}, base)).toBe(true);
  });

  it('should be true when the style changes', () => {
    expect(beerNeedsUpdate(base, {...base, styleId: 9})).toBe(true);
  });

  it('should be true when isNa or beverageType changes', () => {
    expect(beerNeedsUpdate(base, {...base, isNa: true})).toBe(true);
    expect(beerNeedsUpdate(base, {...base, beverageType: 'seltzer'})).toBe(true);
  });
});
