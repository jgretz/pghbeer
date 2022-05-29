import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Beers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  abv: number;

  @Column()
  brewery_id: number;

  @Column()
  style_id: number;

  @Column()
  create_date: Date;

  @Column()
  update_date: Date;
}
