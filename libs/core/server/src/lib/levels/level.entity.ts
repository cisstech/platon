import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../database'

@Entity('Levels')
export class LevelEntity extends BaseEntity {
  @Index('Levels_name_idx', { synchronize: false })
  @Column()
  name!: string
}
