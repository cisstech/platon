import { Injectable, Logger } from '@nestjs/common'
import {
  LTILaunchInterceptor,
  LTILaunchInterceptorArgs,
  RegisterLtiLaunchInterceptor,
} from '@platon/feature/lti/server'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseGroupService } from './course-group/course-group.service'
import { CourseGroupMemberService } from './course-group-member/course-group-member.service'

@Injectable()
@RegisterLtiLaunchInterceptor()
export class CourseLTIInterceptor implements LTILaunchInterceptor {
  protected readonly logger = new Logger(CourseLTIInterceptor.name)

  constructor(
    private readonly courseMemberService: CourseMemberService,
    private readonly courseGroupService: CourseGroupService,
    private readonly courseGroupMemberService: CourseGroupMemberService
  ) {}

  async intercept(args: LTILaunchInterceptorArgs): Promise<void> {
    const courseMatch = args.nextUrl.match(/\/courses\/(?<courseId>[^\\/]+)/)
    const courseId = courseMatch?.groups?.courseId
    const { user } = args.lmsUser
    if (courseId && !(await this.courseMemberService.isMember(courseId, user.id))) {
      this.logger.log(`LTI: Adding ${user.username} to course ${courseId}`)
      await this.courseMemberService.addUser(courseId, user.id)
    }

    if (courseId && args.payload.custom_groups && args.payload.custom_groups.length > 0) {
      for (const group of args.payload.custom_groups.split(',')) {
        await this.courseGroupService.addCourseGroup(group, courseId)
        await this.courseGroupMemberService.addCourseGroupMember(group, user.id)
      }
    }
  }
}
