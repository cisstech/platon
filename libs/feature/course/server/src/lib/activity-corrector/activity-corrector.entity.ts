import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ActivityEntity } from '../activity/activity.entity'
import { CourseMemberEntity } from '../course-member/course-member.entity'

@Entity('ActivityCorrectors')
@Unique('ActivityCorrectors_activity_member_user_idx', ['activityId', 'memberId', 'userId'])
export class ActivityCorrectorEntity extends BaseEntity {
  @Index('ActivityCorrectors_activity_id_idx')
  @Column({ name: 'activity_id' })
  activityId!: string

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity!: ActivityEntity

  @Index('ActivityCorrectors_member_id_idx')
  @Column({ name: 'member_id' })
  memberId!: string

  @ManyToOne(() => CourseMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member!: CourseMemberEntity

  @Index('ActivityCorrectors_user_id_idx')
  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity
}
