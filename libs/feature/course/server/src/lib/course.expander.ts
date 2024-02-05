import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { isTeacherRole } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { CoursePermissions } from '@platon/feature/course/common'
import { CourseDTO } from './course.dto'

@Injectable()
@Expander(CourseDTO)
export class CourseExpander {
  permissions(context: ExpandContext<IRequest, CourseDTO>): CoursePermissions {
    const { request } = context
    return {
      update: isTeacherRole(request.user.role),
    }
  }
}
