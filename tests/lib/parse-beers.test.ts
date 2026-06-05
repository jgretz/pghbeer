import {describe, expect, it} from 'bun:test';

import {
  dedupeBeers,
  isNoiseCell,
  parseAbv,
  parseBeerCell,
  type ParsedBeer,
} from '../../scripts/lib/parse-beers.ts';

function beers(result: ReturnType<typeof parseBeerCell>): ParsedBeer[] {
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result.beers;
}

describe('parseAbv', () => {
  it('should parse a plain number', () => {
    expect(parseAbv('5.3')).toBe(5.3);
  });

  it('should strip a trailing percent', () => {
    expect(parseAbv('6.4%')).toBe(6.4);
  });

  it('should take the low end of a range', () => {
    expect(parseAbv('5-6%')).toBe(5);
  });

  it('should parse a <0.5 token to 0.5', () => {
    expect(parseAbv('<0.5')).toBe(0.5);
  });

  it('should return null for non-numeric text', () => {
    expect(parseAbv('Hazy IPA')).toBeNull();
  });
});

describe('parseBeerCell — no-beers signals', () => {
  it('should treat empty text as no-beers', () => {
    expect(parseBeerCell('   ')).toEqual({ok: false, reason: 'no-beers', raw: '   '});
  });

  it('should treat TBD as no-beers', () => {
    expect(parseBeerCell('TBD - Will send by 6/5')).toMatchObject({ok: false, reason: 'no-beers'});
    expect(parseBeerCell('TBD')).toMatchObject({ok: false, reason: 'no-beers'});
  });

  it('should treat a non-beer vendor row as no-beers', () => {
    const r = parseBeerCell('Non alcohol, vendor, jewelry, stickers, magnets');
    expect(r).toEqual({
      ok: false,
      reason: 'no-beers',
      raw: 'Non alcohol, vendor, jewelry, stickers, magnets',
    });
  });
});

describe('parseBeerCell — structured formats', () => {
  it('should parse period-delimited name+abv with no style (Penn)', () => {
    const b = beers(
      parseBeerCell(
        'Penn N/A 0.5. Penn X Sarris Double Chocolate 5.3. Penn Eisbock 13.7. Penn Light 4.12.',
      ),
    );
    expect(b).toHaveLength(4);
    expect(b[0]).toEqual({name: 'Penn N/A', style: null, abv: 0.5, isNa: true});
    expect(b[2]).toEqual({name: 'Penn Eisbock', style: null, abv: 13.7, isNa: false});
  });

  it('should parse newline "name - style abv%" (Spoonwood)', () => {
    const b = beers(
      parseBeerCell(
        'Shooting Space - West Coast Pils 4.8%\nShellacked! - Hazy IPA 6.4%\nShortcake - Strawberry Creme Ale 6%',
      ),
    );
    expect(b).toHaveLength(3);
    expect(b[0]).toEqual({name: 'Shooting Space', style: 'West Coast Pils', abv: 4.8, isNa: false});
  });

  it('should parse slash fields split by --- (Wye)', () => {
    const b = beers(
      parseBeerCell('Front Porch / Cream Ale / 4.5 --- Haze-Zilla / Double Hazy IPA / 8.3'),
    );
    expect(b).toEqual([
      {name: 'Front Porch', style: 'Cream Ale', abv: 4.5, isNa: false},
      {name: 'Haze-Zilla', style: 'Double Hazy IPA', abv: 8.3, isNa: false},
    ]);
  });

  it('should strip the trailing dash from "name - style - abv" (11th Hour / Cobblehaus)', () => {
    const b = beers(parseBeerCell('New Cult - NEIPA - 7.1, Happy Valley Jack - NEIPA - 6.4'));
    expect(b).toEqual([
      {name: 'New Cult', style: 'NEIPA', abv: 7.1, isNa: false},
      {name: 'Happy Valley Jack', style: 'NEIPA', abv: 6.4, isNa: false},
    ]);
  });

  it('should parse comma list of dashed beers, style null when absent (Dancing Gnome)', () => {
    const b = beers(
      parseBeerCell(
        'Lustra - Hazy Pale 5.8%, Triple Lustra - Triple IPA 11%, Mexican Lager - 5.5%',
      ),
    );
    expect(b).toHaveLength(3);
    expect(b[2]).toEqual({name: 'Mexican Lager', style: null, abv: 5.5, isNa: false});
  });

  it('should parse pipe fields split by & (Chimera)', () => {
    const b = beers(
      parseBeerCell(
        "Perpetual Flow | Hazy IPA | 6.6% & Persephone's Light | Kölsch | 4.8% (this could change depending on our brewing schedule)",
      ),
    );
    expect(b).toHaveLength(2);
    expect(b[0]).toEqual({name: 'Perpetual Flow', style: 'Hazy IPA', abv: 6.6, isNa: false});
    expect(b[1]!.name).toBe("Persephone's Light");
    expect(b[1]!.abv).toBe(4.8);
  });

  it('should parse parenthetical slash blocks, abv null when missing (New France)', () => {
    const b = beers(
      parseBeerCell(
        '(Aestas / Lime Lager / 5.0%) (Joie De Vivre / Belgian White Ale / 5.5%) (As the Crow Flies / Imperial Oatmeal Stout with chocolate) (Retronym / American IPA / 6.5%)',
      ),
    );
    expect(b).toHaveLength(4);
    expect(b[0]).toEqual({name: 'Aestas', style: 'Lime Lager', abv: 5, isNa: false});
    expect(b[2]).toEqual({
      name: 'As the Crow Flies',
      style: 'Imperial Oatmeal Stout with chocolate',
      abv: null,
      isNa: false,
    });
  });

  it('should parse "name (abv%) style" with style after the parens (Cinderlands)', () => {
    const b = beers(
      parseBeerCell(
        'NZ HAHPS (6.6%) west-coast IPA w. NZ hops\nCobra Toes (5.2%) Kölsch-style beer',
      ),
    );
    expect(b).toHaveLength(2);
    expect(b[0]!.name).toBe('NZ HAHPS');
    expect(b[0]!.abv).toBe(6.6);
    expect(b[0]!.style).toContain('west-coast IPA');
  });
});

describe('parseBeerCell — punts ambiguous cells to runway', () => {
  it('should mark a fused name+style comma list as unparseable (ShuBrew)', () => {
    const r = parseBeerCell(
      'Banana Hammock Hefeweizen, Gabagool Italian PIlsner, Hard Landing Hazy Pale Ale',
    );
    expect(r).toEqual({
      ok: false,
      reason: 'unparseable',
      raw: 'Banana Hammock Hefeweizen, Gabagool Italian PIlsner, Hard Landing Hazy Pale Ale',
    });
  });

  it('should mark a bare beer name with no abv/style as unparseable (Free For All NA IPA)', () => {
    expect(parseBeerCell('Free For All NA IPA')).toMatchObject({ok: false, reason: 'unparseable'});
  });

  it('should punt "BeerA (..) and BeerB (..)" multi-beer cells to runway (East End)', () => {
    expect(
      parseBeerCell(
        'Arlington (Grodziskie - 3.6%) and Brighton Heights (Oatmeal Raisin Stout - 7.0%)',
      ),
    ).toMatchObject({ok: false, reason: 'unparseable'});
  });

  it('should punt a parenthetical with non-abv prose to runway (Wild Leaf)', () => {
    expect(
      parseBeerCell('Wild Leaf Hard Green Tea (Flavors: Raspberry, Peach, Pineapple and Citrus)'),
    ).toMatchObject({ok: false, reason: 'unparseable'});
  });
});

describe('isNoiseCell', () => {
  it('should treat form-noise as noise', () => {
    expect(isNoiseCell('Option 1')).toBe(true);
    expect(isNoiseCell('N/A')).toBe(true);
    expect(isNoiseCell('  ')).toBe(true);
  });

  it('should not treat a beer name as noise', () => {
    expect(isNoiseCell('Free For All NA IPA')).toBe(false);
    expect(isNoiseCell('Dry Hop (NA Beer) and Barmy Hop Seltzer Water')).toBe(false);
  });
});

describe('dedupeBeers', () => {
  const mk = (name: string): ParsedBeer => ({name, style: null, abv: null, isNa: false});

  it('should drop an extra beer already present in the primary set (case/space-insensitive)', () => {
    const primary = [mk('Fruity Pebbles')];
    const extra = [mk('fruity  pebbles'), mk('Free For All')];
    expect(dedupeBeers(primary, extra).map((b) => b.name)).toEqual(['Free For All']);
  });
});
