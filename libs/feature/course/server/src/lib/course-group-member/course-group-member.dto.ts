import { BaseDTO } from '@platon/core/server'
import { CourseGroupMember } from '@platon/feature/course/common'

export class CourseGroupMemberDTO extends BaseDTO implements CourseGroupMember {
  readonly groupId!: string

  readonly userId!: string
}
