// Sheet brewery names that should resolve to an existing canonical record
// instead of creating a new one. Case-insensitive matching already handles
// pure casing differences (SPOONWOOD vs Spoonwood); this map is for genuine
// name *variants* the sheet uses that don't differ only by case.
//
// Keyed by the lowercased sheet name -> the canonical display name to use.
export const BREWERY_ALIASES: Record<string, string> = {
  'wild leaf': 'Wild Leaf Hard Tea',
  'hitchhiker brewing': 'Hitchhiker Brewing Company',
};

// Resolve a raw sheet name to its canonical form (alias if known, else itself).
export function canonicalBreweryName(name: string): string {
  return BREWERY_ALIASES[name.trim().toLowerCase()] ?? name;
}
