import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../database';

@Entity('Levels')
export class LevelEntity extends BaseEntity {
  @Column()
  name!: string
}
