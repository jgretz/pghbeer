import {describe, expect, it} from 'bun:test';

import {
  buildHistory,
  detectNa,
  loadStyleSeed,
  matchStyle,
  normalizeStyle,
  type StyleSeed,
} from '../../scripts/lib/classify.ts';

const seed: StyleSeed = {
  exact: {
    malbec: {type: 'wine'},
    whiskey: {type: 'cocktail'},
  },
  keywords: [
    {includes: 'non-alc', type: 'beer', isNa: true},
    {includes: 'cocktail', type: 'cocktail'},
    {includes: 'cider', type: 'cider'},
    {includes: 'seltzer', type: 'seltzer'},
    {includes: 'mead', type: 'mead'},
    {includes: 'hard tea', type: 'hard_tea'},
  ],
};

const history = buildHistory(seed.exact);

describe('normalizeStyle', () => {
  it('should lowercase, trim, and collapse whitespace', () => {
    expect(normalizeStyle('  Hard   Cider ')).toBe('hard cider');
  });
});

describe('matchStyle', () => {
  it('should hit the exact history map regardless of case/spacing', () => {
    expect(matchStyle('  Malbec ', history, seed.keywords)).toEqual({type: 'wine', isNa: false});
    expect(matchStyle('Whiskey', history, seed.keywords)).toEqual({type: 'cocktail', isNa: false});
  });

  it('should match phrasing variants by substring keyword', () => {
    expect(matchStyle('Ready-to-Drink Cocktail', history, seed.keywords)).toEqual({
      type: 'cocktail',
      isNa: false,
    });
    expect(matchStyle('Hard Apple Cider', history, seed.keywords)).toEqual({
      type: 'cider',
      isNa: false,
    });
  });

  it('should carry isNa from a keyword rule', () => {
    expect(matchStyle('Non-Alcoholic Ginger Beer', history, seed.keywords)).toEqual({
      type: 'beer',
      isNa: true,
    });
  });

  it('should return null (→ LLM) for styles with no safe match', () => {
    expect(matchStyle('Barleywine', history, seed.keywords)).toBeNull();
    expect(matchStyle('Whiskey Barrel-Aged Imperial Stout', history, seed.keywords)).toBeNull();
    expect(matchStyle('West Coast IPA', history, seed.keywords)).toBeNull();
  });

  it('should let a ledger cache entry override the seed for the same style', () => {
    const withCache = buildHistory(seed.exact, {'west coast ipa': {type: 'beer'}});
    expect(matchStyle('West Coast IPA', withCache, seed.keywords)).toEqual({
      type: 'beer',
      isNa: false,
    });
  });
});

describe('loadStyleSeed', () => {
  it('should load the checked-in seed and drop the comment field', async () => {
    const loaded = await loadStyleSeed();
    expect(loaded.exact['malbec']).toEqual({type: 'wine'});
    expect(loaded.keywords.some((k) => k.includes === 'cocktail')).toBe(true);
    expect((loaded as unknown as {_comment?: string})._comment).toBeUndefined();
  });
});

describe('detectNa', () => {
  it('should detect NA / non-alcoholic / water markers in free text', () => {
    expect(detectNa('Free For All NA IPA')).toBe(true);
    expect(detectNa('Fruity Pebbles - Non-Alc Fruited Blonde - <0.5%')).toBe(true);
    expect(detectNa('Hop Run Sparkling Hop Water')).toBe(true);
    expect(detectNa('Dry Hop (NA Beer)')).toBe(true);
    expect(detectNa('0.0% Lager')).toBe(true);
  });

  it('should not flag ordinary beers', () => {
    expect(detectNa('Hazy IPA 6.4%')).toBe(false);
    expect(detectNa('Banana Hammock Hefeweizen')).toBe(false);
    expect(detectNa('West Coast Pils')).toBe(false);
  });
});
