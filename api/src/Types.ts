export interface ReadService<T> {
  findAll(): Promise<T[]>;
}

export enum StatOpinion {
  Tasted = 0,
  Liked = 1,
  Disliked = 2,
}
