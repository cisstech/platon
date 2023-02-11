import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../database';

@Entity('Levels')
export class LevelEntity extends BaseEntity {
  @Index('Levels_name_idx', { unique: true })
  @Column()
  name!: string
}
