import { User } from '@platon/core/common'
import { CourseMember } from './course-member.model'

export interface ActivityCorrector {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly activityId: string
  readonly user?: User
  readonly member: CourseMember
}

export interface CreateActivityCorrector {
  readonly userId?: string
  readonly memberId?: string
}
