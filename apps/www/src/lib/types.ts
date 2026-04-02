export type BeverageType =
  | 'beer'
  | 'wine'
  | 'mead'
  | 'cocktail'
  | 'cider'
  | 'seltzer'
  | 'hard_tea'
  | 'na';

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

export interface BreweryGroup {
  name: string;
  beers: Beer[];
}

export interface FilterState {
  search: string;
  activeTypes: Set<BeverageType>;
  naOnly: boolean;
  showTriedOnly: boolean;
}
