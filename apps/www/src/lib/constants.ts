export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
export const EVENT_ID = import.meta.env.VITE_EVENT_ID ?? '6';

export const STORAGE_KEYS = {
  theme: 'pghbeer-theme',
  tried: 'pghbeer-tried-2026',
  userId: 'pghbeer-user-id',
  queryCache: 'pghbeer-query-cache-v2',
} as const;

export const BEVERAGE_ICONS: Record<string, string> = {
  beer: '\u{1F37A}',
  wine: '\u{1F377}',
  mead: '\u{1F36F}',
  cocktail: '\u{1F379}',
  cider: '\u{1F34E}',
  seltzer: '\u{1F95B}',
  hard_tea: '\u{1FAD6}',
  na: '\u{1F375}',
};

export const BEVERAGE_LABELS: Record<string, string> = {
  beer: 'Beer',
  wine: 'Wine',
  mead: 'Mead',
  cocktail: 'Cocktail',
  cider: 'Cider',
  seltzer: 'Seltzer',
  hard_tea: 'Hard Tea',
  na: 'NA',
};
