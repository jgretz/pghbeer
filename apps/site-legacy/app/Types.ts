// Base Types
export interface Brewery {
  id: number;
  name: string;
}

export interface Style {
  name: string;
}

export interface Beer {
  id: number;
  name: string;
  abv: number;
  brewery: Brewery;
  style: Style;
}

// API Types
export interface EventItemData {
  beer: Beer;
}

export interface StatItemData {
  opinion: number;
  user_id: number;
  date: string;

  beer: Beer;
}

// Local Storage Types
export interface SessionData {
  checked_beers: string;
}

// Loader Types
export interface IndexLoaderData {
  breweries: string[];
  data: Record<string, Beer[]>;
}

export interface StatsCountListItem {
  name: string;
  count: number;
}

export interface StatsLoaderData {
  topLineStats: {
    totalUsers: number;
    totalUniqueBeersDrank: number;
    totalBeersDrank: number;
  };

  beers: StatsCountListItem[];
  breweries: StatsCountListItem[];
  styles: StatsCountListItem[];
}
