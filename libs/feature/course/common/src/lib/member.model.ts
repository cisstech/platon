import { OrderingDirections, User, UserGroup, UserOrderings, UserRoles } from '@platon/core/common'
import { UserDTO } from '@platon/core/server'

export interface CourseMember {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly courseId: string
  readonly user?: User
  readonly group?: UserGroup
}

export interface CreateCourseMember {
  readonly id: string
  readonly isGroup?: boolean
}

export interface CourseMemberFilters {
  readonly roles?: UserRoles[]
  readonly search?: string
  readonly offset?: number
  readonly limit?: number
  readonly order?: UserOrderings | keyof typeof UserOrderings
  readonly direction?: OrderingDirections | keyof typeof OrderingDirections
}

export interface ActivityMember {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly activityId: string
  readonly user?: UserDTO
  readonly member: CourseMember
}

export interface CreateActivityMember {
  readonly userId?: string
  readonly memberId?: string
}
