export interface Data {
  beer: Beer;
}

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
