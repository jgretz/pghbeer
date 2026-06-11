import {describe, expect, it} from 'bun:test';

import {lookupOverride, rowHasOverride} from '../../scripts/lib/beer-overrides.ts';
import type {SheetRow} from '../../scripts/lib/sheet.ts';

const row = (over: Partial<SheetRow> = {}): SheetRow => ({
  rowIndex: 2,
  timestamp: '5/28/2026 12:00:17',
  brewery: 'Lucky Sign Spirits',
  beerListRaw: 'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
  naRaw: '',
  specialRaw: '',
  ...over,
});

describe('lookupOverride', () => {
  it('should return the hand-authored beers for a known (brewery, raw) cell', () => {
    const beers = lookupOverride(
      'Lucky Sign Spirits',
      'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
    );
    expect(beers).toEqual([
      {name: 'Key Lime & Dill', style: 'Cocktail', abv: null, isNa: false},
      {name: 'Blood Orange & Rosemary', style: 'Cocktail', abv: null, isNa: false},
    ]);
  });

  it('should match the raw cell ignoring case and surrounding/collapsed whitespace', () => {
    const beers = lookupOverride(
      '  lucky sign spirits ',
      '  Canned cocktails -   Key Lime & Dill,  Blood Orange & Rosemary ',
    );
    expect(beers).toHaveLength(2);
  });

  it('should split an NA list into NA beers and drop the trailing "maybe more"', () => {
    const beers = lookupOverride(
      'Lucky Sign Spirits',
      'Grapefruit Cucumber Dill - Watermelon Elderflower Basil - maybe more',
    );
    expect(beers).toEqual([
      {name: 'Grapefruit Cucumber Dill', style: 'Cocktail', abv: null, isNa: true},
      {name: 'Watermelon Elderflower Basil', style: 'Cocktail', abv: null, isNa: true},
    ]);
  });

  it('should return null when no override matches', () => {
    expect(lookupOverride('Dancing Gnome', 'Lustra')).toBeNull();
    expect(lookupOverride('Lucky Sign Spirits', 'some other cell')).toBeNull();
  });
});

describe('rowHasOverride', () => {
  it('should be true when the K cell matches an override', () => {
    expect(rowHasOverride(row())).toBe(true);
  });

  it('should be true when only an M/N cell matches an override', () => {
    expect(
      rowHasOverride(
        row({
          beerListRaw: 'TBD',
          naRaw: 'Grapefruit Cucumber Dill - Watermelon Elderflower Basil - maybe more',
        }),
      ),
    ).toBe(true);
  });

  it('should be false when no cell matches', () => {
    expect(rowHasOverride(row({brewery: 'Dancing Gnome', beerListRaw: 'Lustra'}))).toBe(false);
  });
});
