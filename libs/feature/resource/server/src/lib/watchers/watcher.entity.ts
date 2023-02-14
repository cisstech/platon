import { BaseEntity, UserEntity } from '@platon/core/server';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ResourceEntity } from '../resource.entity';


@Entity('ResourceWatchers')
@Unique('ResourceWatchers_unique_idx', ['userId', 'resourceId'])
export class ResourceWatcherEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity
}

