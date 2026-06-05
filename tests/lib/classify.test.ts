import {describe, expect, it} from 'bun:test';

import {classifyStyle, detectNa} from '../../scripts/lib/classify.ts';

describe('classifyStyle', () => {
  it('should classify an NA style by exact match', () => {
    expect(classifyStyle('non-alcoholic')).toEqual({type: 'beer', isNa: true});
  });

  it('should classify wine / cider / seltzer / hard_tea styles', () => {
    expect(classifyStyle('Malbec')).toEqual({type: 'wine', isNa: false});
    expect(classifyStyle('Hard Cider')).toEqual({type: 'cider', isNa: false});
    expect(classifyStyle('Hard Seltzer')).toEqual({type: 'seltzer', isNa: false});
    expect(classifyStyle('Hard Tea')).toEqual({type: 'hard_tea', isNa: false});
  });

  it('should default unknown styles to beer', () => {
    expect(classifyStyle('Hazy IPA')).toEqual({type: 'beer', isNa: false});
    expect(classifyStyle('Unknown')).toEqual({type: 'beer', isNa: false});
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
