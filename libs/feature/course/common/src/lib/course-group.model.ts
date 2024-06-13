import { CourseMember } from './member.model'

export interface CourseGroup {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly groupId: string
  readonly courseId: string
  readonly name: string
}

export interface UpdateGroup {
  readonly name: string
}

export interface CourseGroupMember {
  readonly groupId: string
  readonly userId: string
}

export interface CourseGroupDetail {
  readonly courseGroup: CourseGroup
  readonly members: CourseMember[]
}

export interface ActivityGroup {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly activityId: string
  readonly groupId: string
}
