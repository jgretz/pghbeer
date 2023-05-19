export interface ReadService<T> {
  findAll(): Promise<T[]>;
}
