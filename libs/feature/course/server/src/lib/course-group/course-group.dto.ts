import { BaseDTO } from '@platon/core/server'
import { CourseGroup, UpdateGroup } from '@platon/feature/course/common'

export class CourseGroupDTO extends BaseDTO implements CourseGroup {
  readonly groupId!: string

  readonly courseId!: string

  readonly name!: string
}

export class UpdateGroupDTO implements UpdateGroup {
  readonly name!: string
}
