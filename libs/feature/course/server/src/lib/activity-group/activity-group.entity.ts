import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ActivityEntity } from '../activity/activity.entity'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { BaseEntity } from '@platon/core/server'

@Entity('ActivityGroup')
@Unique('ActivityGroups_activity_group_idx', ['activityId', 'groupId'])
export class ActivityGroupEntity extends BaseEntity {
  @Index('ActivityGroups_activity_id_idx')
  @Column({ name: 'activity_id' })
  activityId!: string

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity!: ActivityEntity

  @Index('ActivityGroups_group_id_idx')
  @Column({ name: 'group_id' })
  groupId!: string

  @ManyToOne(() => CourseGroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: CourseGroupEntity
}
