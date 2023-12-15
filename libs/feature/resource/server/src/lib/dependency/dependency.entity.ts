import { BaseEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { ResourceEntity } from '../resource.entity'

@Entity('ResourceDependencies')
export class ResourceDependencyEntity extends BaseEntity {
  @Column({ name: 'resource_version' })
  resourceVersion!: string

  @Index('ResourceDependencies_resource_id_idx')
  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column({ name: 'depend_on_version' })
  dependOnVersion!: string

  @Index('ResourceDependencies_depend_on_id_idx')
  @Column({ name: 'depend_on_id' })
  dependOnId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'depend_on_id' })
  dependOn!: ResourceEntity
}
