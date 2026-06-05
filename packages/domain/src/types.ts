import {beverageTypeEnum, type BeverageType as DbBeverageType} from 'database';
import {z} from 'zod';

// Shared types matching the API response shapes

export interface Brewery {
  id: number;
  name: string;
}

export interface Style {
  name: string;
}

export type BeverageType =
  | 'beer'
  | 'wine'
  | 'mead'
  | 'cocktail'
  | 'cider'
  | 'seltzer'
  | 'hard_tea'
  | 'na';

export interface Beer {
  id: number;
  name: string;
  abv: number | null;
  beverageType: BeverageType;
  isNA: boolean;
  brewery: Brewery;
  style: Style;
}

export interface EventInfo {
  name: string;
  date: string;
}

export interface EventBeerItem {
  beer: Beer;
}

export interface EventData {
  event: EventInfo;
  beers: EventBeerItem[];
}

export interface StatItem {
  opinion: number;
  user_id: number;
  date: Date;
  beer: Beer;
}

export const StatOpinion = {
  Tasted: 0,
  Liked: 1,
  Disliked: 2,
} as const;

export const updateStatsSchema = z.object({
  beerId: z.number(),
  eventId: z.number(),
  userId: z.string(),
  tasted: z.boolean(),
});

export type UpdateStatsInput = z.infer<typeof updateStatsSchema>;

// --- Admin CRUD ---
// Write-surface row shapes returned by the admin endpoints. BeerListItem is
// intentionally distinct from the read-side Beer type (which uses isNA and a
// name-only style) — the admin console needs ids on both relations.

export interface BreweryRow {
  id: number;
  name: string;
}

export interface StyleRow {
  id: number;
  name: string;
}

export interface EventRow {
  id: number;
  name: string;
  date: string;
}

export interface BeerListItem {
  id: number;
  name: string;
  abv: number | null;
  beverageType: BeverageType;
  isNa: boolean;
  brewery: {id: number; name: string};
  style: {id: number; name: string};
}

// Safe-delete result: deletes refuse rather than cascade. When dependents
// exist the command returns the per-entity counts and performs no delete.
export type DeleteResult =
  | {ok: true}
  | {ok: false; dependents: Record<string, number>};

// Cast the readonly drizzle enumValues to z.enum's mutable-tuple shape while
// preserving the literal union so the inferred input matches the DB column
// type (the 7 DB values — 'na' is the separate isNa boolean, not a value here).
const beverageTypeSchema = z.enum(
  beverageTypeEnum.enumValues as unknown as [DbBeverageType, ...DbBeverageType[]],
);

export const createBrewerySchema = z.object({name: z.string().min(1)});
export const updateBrewerySchema = z.object({name: z.string().min(1)});
export type CreateBreweryInput = z.infer<typeof createBrewerySchema>;
export type UpdateBreweryInput = z.infer<typeof updateBrewerySchema>;

export const createStyleSchema = z.object({name: z.string().min(1)});
export const updateStyleSchema = z.object({name: z.string().min(1)});
export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type UpdateStyleInput = z.infer<typeof updateStyleSchema>;

export const createBeerSchema = z.object({
  name: z.string().min(1),
  abv: z.number().nullable(),
  beverageType: beverageTypeSchema,
  isNa: z.boolean(),
  breweryId: z.number().int(),
  styleId: z.number().int(),
});
export const updateBeerSchema = createBeerSchema.partial();
export type CreateBeerInput = z.infer<typeof createBeerSchema>;
export type UpdateBeerInput = z.infer<typeof updateBeerSchema>;

export const createEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
});
export const updateEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const addBeerToEventSchema = z.object({beerId: z.number().int()});
export type AddBeerToEventInput = z.infer<typeof addBeerToEventSchema>;

export interface VelocityBucket {
  bucket: string;
  total: number;
  na: number;
}

export interface TopBeer {
  name: string;
  breweryName: string;
  count: number;
  recentCount: number;
}

export interface TopBrewery {
  name: string;
  count: number;
  beerCount: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface StyleTrendBucket {
  bucket: string;
  [style: string]: string | number;
}

export interface DistributionBucket {
  bucket: string;
  count: number;
}

export interface ColdSpots {
  totalBreweries: number;
  avgCheckins: number;
  breweries: {name: string; count: number; beerCount: number}[];
}

export interface DashboardStats {
  totalCheckins: number;
  activeUsers: number;
  uniqueUsers: number;
  naCheckins: number;
  velocity: VelocityBucket[];
  topBeers: TopBeer[];
  topBreweries: TopBrewery[];
  byType: TypeCount[];
  styleTrends: StyleTrendBucket[];
  beersPerPerson: DistributionBucket[];
  coldSpots: ColdSpots;
  generatedAt: string;
}
