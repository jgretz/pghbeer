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
