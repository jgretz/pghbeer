export interface BaseObject {
  id: number;

  create_date: Date;
  update_date: Date;
}

export interface Beer extends BaseObject {
  name: string;
  abv: number;
  brewery_id: number;
  style_id: number;
}

export interface Brewery extends BaseObject {
  name: string;
}

export interface EventBeerListItem extends BaseObject {
  event_id: number;
  beer_id: number;
}

export interface Event extends BaseObject {
  name: string;
}

export interface Stat extends BaseObject {
  date: Date;
  opinion: StatOpinion;
  beer_id: number;
  user_id: number;
  event_id: number;
}

export enum StatOpinion {
  Unknown = 0,
  Like = 1,
  Dislike = 2,
}

export interface BeerStyle extends BaseObject {
  name: string;
}

export interface User extends BaseObject {
  name: string;
  email: string;
  webuserid: string;
}

export interface BeerDetail {
  brewery: Brewery;
  beer: Beer;
  style: BeerStyle;
  opinion?: Stat;
}
