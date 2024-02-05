import { User } from '@platon/core/common'
import { CourseMember } from './member.model'

export interface Corrector {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly activityId: string
  readonly userId: string
  readonly users: string[]
}

export interface CreateCorrector {
  readonly userId: string
}

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
