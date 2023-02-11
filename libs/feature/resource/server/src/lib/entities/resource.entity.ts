import { BaseEntity, LevelEntity, TopicEntity, UserEntity } from '@platon/core/server';
import { ResourceStatus, ResourceTypes, ResourceVisibilities } from '@platon/feature/resource/common';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('Resources')
export class ResourceEntity extends BaseEntity {
  @Column()
  name!: string

  @Column({ nullable: true })
  desc?: string

  @Column({ type: 'enum', enum: ResourceTypes })
  type!: ResourceTypes

  @Column({ type: 'enum', enum: ResourceVisibilities })
  visibility!: ResourceVisibilities

  @Column({ type: 'enum', enum: ResourceStatus, default: ResourceStatus.READY })
  status!: ResourceStatus

  @ManyToMany(() => LevelEntity, {
    eager: true
  })
  @JoinTable()
  levels!: LevelEntity[]

  @ManyToMany(() => TopicEntity, {
    eager: true
  })
  @JoinTable()
  topics!: TopicEntity[]

  @Column({ name: 'owner_id' })
  ownerId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: ResourceEntity
}
