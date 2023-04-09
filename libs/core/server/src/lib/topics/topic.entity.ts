import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../database';

@Entity('Topics')
export class TopicEntity extends BaseEntity {
  @Index('Topics_name_idx', { synchronize: false })
  @Column()
  name!: string
}
