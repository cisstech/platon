/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { ResourceEventTypes } from '@platon/feature/resource/common'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { ResourceEntity } from '../resource.entity'

@Entity('ResourceEvents')
export class ResourceEventEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ResourceEventTypes })
  type!: ResourceEventTypes

  @Index('ResourceEvents_actor_id_idx')
  @Column({ name: 'actor_id' })
  actorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor!: UserEntity

  @Index('ResourceEvents_resource_id_idx')
  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column({ type: 'jsonb' })
  data!: Record<string, any>
}
