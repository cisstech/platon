import { Level } from './level.model'
import { OrderingDirections } from './ordering.model'
import { Topic } from './topic.model'

export enum UserRoles {
  admin = 'admin',
  teacher = 'teacher',
  student = 'student',
  demo = 'demo',
}

export enum UserOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export enum UserGroupOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface User {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly role: UserRoles
  readonly username: string
  readonly active: boolean
  readonly firstName?: string
  readonly lastName?: string
  readonly email?: string
  readonly lastLogin?: Date
  readonly firstLogin?: Date
  readonly hasPassword?: boolean
  readonly discordId?: string
}

export interface UpdateUser {
  readonly role?: UserRoles | keyof typeof UserRoles
  readonly firstName?: string
  readonly lastName?: string
  readonly email?: string
  readonly active?: boolean
  readonly discordId?: string
}

export interface UserPrefs {
  readonly levels: Level[]
  readonly topics: Topic[]
}

export class UpdateUserPrefs {
  readonly levels?: string[]
  readonly topics?: string[]
}

export interface UserFilters {
  readonly roles?: (UserRoles | keyof typeof UserRoles)[]
  readonly search?: string
  readonly active?: boolean
  readonly groups?: string[]
  readonly lmses?: string[]
  readonly offset?: number
  readonly limit?: number
  readonly order?: UserOrderings | keyof typeof UserOrderings
  readonly direction?: OrderingDirections | keyof typeof OrderingDirections
}

export interface UserGroup {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly name: string
  readonly users: User[]
}

export interface CreateUserGroup {
  readonly name: string
  readonly users?: string[]
}

export interface UpdateUserGroup {
  readonly name?: string
  readonly users?: string[]
}

export interface UserGroupFilters {
  readonly search?: string
  readonly offset?: number
  readonly limit?: number
  readonly order?: UserGroupOrderings
  readonly direction?: OrderingDirections
}

export const USER_ORDERING_DIRECTIONS: Readonly<Record<UserOrderings, keyof typeof OrderingDirections>> = {
  NAME: 'ASC',
  CREATED_AT: 'DESC',
  UPDATED_AT: 'DESC',
}

export const USER_GROUP_ORDERING_DIRECTIONS: Readonly<Record<UserGroupOrderings, keyof typeof OrderingDirections>> = {
  NAME: 'ASC',
  CREATED_AT: 'DESC',
  UPDATED_AT: 'DESC',
}

export const userDisplayName = (user: User): string => {
  return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username
}

export const isTeacherRole = (role: UserRoles) => [UserRoles.admin, UserRoles.teacher].includes(role)

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
