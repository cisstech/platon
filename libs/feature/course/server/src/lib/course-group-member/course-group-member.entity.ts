import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { BaseEntity, UserEntity } from '@platon/core/server'

@Entity('CourseGroupsMember')
@Unique('Unique_CourseGroupMember', ['groupId', 'userId'])
export class CourseGroupMemberEntity extends BaseEntity {
  @Index('CourseGroups_name_idx')
  @Column({ name: 'group_id' })
  groupId!: string

  @Index('CourseGroups_user_id_idx')
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity
}
