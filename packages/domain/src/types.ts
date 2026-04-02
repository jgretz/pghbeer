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
