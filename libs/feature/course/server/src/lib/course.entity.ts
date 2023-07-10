/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('Courses')
export class CourseEntity extends BaseEntity {
  @Index('Courses_name_idx', { synchronize: false })
  @Column()
  name!: string

  @Column({ nullable: true })
  desc?: string

  @Index('Courses_owner_id_idx')
  @Column({ name: 'owner_id' })
  ownerId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity
}
