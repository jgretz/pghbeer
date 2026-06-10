import {describe, expect, it} from 'bun:test';

import {canonicalBreweryName} from '../../scripts/lib/brewery-aliases.ts';

describe('canonicalBreweryName', () => {
  it('should map a known alias to its canonical name', () => {
    expect(canonicalBreweryName('Wild Leaf')).toBe('Wild Leaf Hard Tea');
    expect(canonicalBreweryName('Hitchhiker Brewing')).toBe('Hitchhiker Brewing Company');
  });

  it('should match aliases case-insensitively and trim whitespace', () => {
    expect(canonicalBreweryName('  WILD LEAF  ')).toBe('Wild Leaf Hard Tea');
  });

  it('should return the original name when no alias matches', () => {
    expect(canonicalBreweryName('Dancing Gnome')).toBe('Dancing Gnome');
  });
});
