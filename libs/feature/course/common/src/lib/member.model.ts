import { OrderingDirections, User, UserGroup, UserOrderings, UserRoles } from '@platon/core/common'
import { UserDTO } from '@platon/core/server'

export enum CourseMemberRoles {
  student = 'student',
  teacher = 'teacher',
}

export interface CourseMember {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly courseId: string
  readonly user?: User
  readonly group?: UserGroup
  readonly role?: CourseMemberRoles
}

export interface CourseMemberView {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly courseId: string
  readonly user: User
  readonly role: CourseMemberRoles
  readonly user_role: UserRoles
}

export interface CreateCourseMember {
  readonly id: string
  readonly isGroup?: boolean
  readonly role?: CourseMemberRoles
}

export interface UpdateCourseMemberRole {
  readonly id: string
  readonly role: CourseMemberRoles
}

export interface CourseMemberFilters {
  readonly roles?: CourseMemberRoles[]
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
