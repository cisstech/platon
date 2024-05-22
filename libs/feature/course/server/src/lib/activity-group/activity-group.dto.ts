import { Type } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { CourseGroupDTO } from '../course-group/course-group.dto'
import { BaseDTO } from '@platon/core/server'
import { ActivityGroup } from '@platon/feature/course/common'

export class ActivityGroupDTO extends BaseDTO implements ActivityGroup {
  @IsUUID()
  readonly activityId!: string

  @Type(() => CourseGroupDTO)
  readonly group!: CourseGroupDTO
}
