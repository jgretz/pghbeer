import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Styles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  create_date: Date;

  @Column()
  update_date: Date;
}
