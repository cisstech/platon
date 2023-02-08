import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../database';

@Entity('Topics')
export class TopicEntity extends BaseEntity {
  @Column()
  name!: string
}
