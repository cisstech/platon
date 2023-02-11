import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../database';

@Entity('Topics')
export class TopicEntity extends BaseEntity {
  @Index('Topics_name_idx', { unique: true })
  @Column()
  name!: string
}
