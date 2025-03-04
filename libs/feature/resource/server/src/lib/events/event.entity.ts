import { BaseEntity, UserEntity } from '@platon/core/server'
import { ResourceEventData, ResourceEventTypes } from '@platon/feature/resource/common'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { ResourceEntity } from '../resource.entity'

@Entity('ResourceEvents')
export class ResourceEventEntity<TData = ResourceEventData> extends BaseEntity {
  @Column({ type: 'enum', enum: ResourceEventTypes })
  type!: ResourceEventTypes

  @Index('ResourceEvents_actor_id_idx')
  @Column({ name: 'actor_id', default: '00000000-0000-0000-0000-000000000000' })
  actorId!: string

  // @ts-expect-error: SET DEFAULT does not exist in OnDeleteType
  @ManyToOne(() => UserEntity, { onDelete: 'SET DEFAULT' })
  @JoinColumn({ name: 'actor_id' })
  actor!: UserEntity

  @Index('ResourceEvents_resource_id_idx')
  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column({ type: 'jsonb' })
  data!: TData
}
