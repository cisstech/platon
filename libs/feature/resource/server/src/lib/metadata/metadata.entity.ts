import { BaseEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { ResourceEntity } from '../resource.entity'

@Entity('ResourceMeta')
export class ResourceMetaEntity extends BaseEntity {
  @Column({ type: 'jsonb', default: {} })
  meta!: object

  @Index('ResourceMeta_resource_idx')
  @Column({ name: 'resource_id', unique: true })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity
}
