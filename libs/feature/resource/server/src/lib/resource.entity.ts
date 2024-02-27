import { BaseEntity, LevelEntity, TopicEntity, UserEntity } from '@platon/core/server'
import { ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'

@Entity('Resources')
export class ResourceEntity extends BaseEntity {
  @Index('Resources_name_idx', { synchronize: false })
  @Column()
  name!: string

  @Index('Resources_personal_idx')
  @Column({ type: 'boolean', name: 'personal', default: false })
  personal!: boolean

  @Column({ nullable: true })
  desc?: string

  @Index('Resources_code_idx', { unique: true })
  @Column({ nullable: true })
  code?: string

  @Index('Resources_type_idx')
  @Column({ type: 'enum', enum: ResourceTypes })
  type!: ResourceTypes

  @Index('Resources_status_idx')
  @Column({ type: 'enum', enum: ResourceStatus, default: ResourceStatus.READY })
  status!: ResourceStatus

  @ManyToMany(() => LevelEntity, {
    eager: true,
  })
  @JoinTable({
    name: 'ResourceLevels',
    joinColumn: {
      name: 'resource_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'level_id',
      referencedColumnName: 'id',
    },
  })
  levels!: LevelEntity[]

  @ManyToMany(() => TopicEntity, {
    eager: true,
  })
  @JoinTable({
    name: 'ResourceTopics',
    joinColumn: {
      name: 'resource_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'topic_id',
      referencedColumnName: 'id',
    },
  })
  topics!: TopicEntity[]

  @Index('Resources_owner_idx')
  @Column({ name: 'owner_id' })
  ownerId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity

  @Index('Resources_parent_idx')
  @Column({ name: 'parent_id', nullable: true })
  parentId?: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: ResourceEntity

  @Index('Resources_parent_idx')
  @Column({ name: 'template_id', nullable: true })
  templateId?: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'template_id' })
  template?: ResourceEntity

  @Index('Resources_version_idx')
  @Column({ name: 'template_version', nullable: true })
  templateVersion?: string

  @Index('Resources_public_preview_idx')
  @Column({ type: 'boolean', name: 'public_preview', default: false })
  publicPreview!: boolean
}
