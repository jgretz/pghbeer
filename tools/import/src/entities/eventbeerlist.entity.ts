import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Eventbeerlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @Column()
  beer_id: number;

  @Column()
  create_date: Date;

  @Column()
  update_date: Date;
}
