import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { IRequest } from '@platon/core/server'
import { CoursePermissions } from '@platon/feature/course/common'
import { CourseDTO } from './course.dto'
import { CourseMemberService } from './course-member/course-member.service'

@Injectable()
@Expander(CourseDTO)
export class CourseExpander {
  constructor(private readonly courseMemberService: CourseMemberService) {}

  async permissions(context: ExpandContext<IRequest, CourseDTO>): Promise<CoursePermissions> {
    const { request, parent } = context

    return {
      update:
        request.user.id === parent.ownerId ||
        (await this.courseMemberService.hasWritePermission(parent.id, request.user)),
    }
  }
}
