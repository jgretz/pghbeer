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
  breweryId: number;
  name: string;
  beers: Beer[];
}

export type MapSlotKind = 'table' | 'zone' | 'label';

export interface MapSlot {
  id: number;
  label: string;
  kind: MapSlotKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number | null;
  vertical: boolean;
  locked: boolean;
  breweryId: number | null;
  breweryName: string | null;
}

export interface MapLayout {
  id: number;
  eventId: number;
  name: string;
  isActive: boolean;
  width: number;
  height: number;
  slots: MapSlot[];
}

export interface EventMap {
  enabled: boolean;
  activeLayout: MapLayout | null;
}

export interface FilterState {
  search: string;
  activeTypes: Set<BeverageType>;
  naOnly: boolean;
  showTriedOnly: boolean;
}

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
