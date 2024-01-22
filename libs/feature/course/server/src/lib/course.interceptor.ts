import { Injectable, Logger } from '@nestjs/common'
import {
  LTILaunchInterceptor,
  LTILaunchInterceptorArgs,
  RegisterLtiLaunchInterceptor,
} from '@platon/feature/lti/server'
import { CourseMemberService } from './course-member/course-member.service'

@Injectable()
@RegisterLtiLaunchInterceptor()
export class CourseLTIInterceptor implements LTILaunchInterceptor {
  protected readonly logger = new Logger(CourseLTIInterceptor.name)

  constructor(private readonly courseMemberService: CourseMemberService) {}

  async intercept(args: LTILaunchInterceptorArgs): Promise<void> {
    const courseMatch = args.nextUrl.match(/\/courses\/(?<courseId>[^\\/]+)/)
    const courseId = courseMatch?.groups?.courseId
    const { user } = args.lmsUser
    if (courseId && !(await this.courseMemberService.isMember(courseId, user.id))) {
      this.logger.log(`LTI: Adding ${user.username} to course ${courseId}`)
      await this.courseMemberService.addUser(courseId, user.id)
    }
  }
}
