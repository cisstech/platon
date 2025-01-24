import { Injectable, Logger } from '@nestjs/common'
import {
  LTILaunchInterceptor,
  LTILaunchInterceptorArgs,
  RegisterLtiLaunchInterceptor,
} from '@platon/feature/lti/server'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseGroupService } from './course-group/course-group.service'
import { CourseGroupMemberService } from './course-group-member/course-group-member.service'
import { CourseMemberRoles } from '@platon/feature/course/common'
import { CourseService } from './services/course.service'
import { LmsCourseService } from './services/lms-course.service'

@Injectable()
@RegisterLtiLaunchInterceptor()
export class CourseLTIInterceptor implements LTILaunchInterceptor {
  protected readonly logger = new Logger(CourseLTIInterceptor.name)

  constructor(
    private readonly CourseService: CourseService,
    private readonly lmsCourseService: LmsCourseService,
    private readonly courseMemberService: CourseMemberService,
    private readonly courseGroupService: CourseGroupService,
    private readonly courseGroupMemberService: CourseGroupMemberService
  ) {}

  private getRoleFromPayload(payload: unknown): CourseMemberRoles {
    if (payload && typeof payload == 'object' && 'is_instructor' in payload && payload.is_instructor) {
      return CourseMemberRoles.teacher
    }
    return CourseMemberRoles.student
  }

  async intercept(args: LTILaunchInterceptorArgs): Promise<void> {
    const courseMatch = args.nextUrl.match(/\/courses\/(?<courseId>[^\\/]+)/)
    let courseId = courseMatch?.groups?.['courseId']
    const { user } = args.lmsUser
    if (courseId) {
      const courseMemberOptional = await this.courseMemberService.getByUserIdAndCourseId(user.id, courseId)
      courseMemberOptional.ifPresentOrElse(
        (member) =>
          member.role === this.getRoleFromPayload(args.payload)
            ? member
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.courseMemberService.updateRole(courseId!, member.id, this.getRoleFromPayload(args.payload)),
        () => {
          this.logger.log(`LTI: Adding ${user.username} to course ${courseId}`)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return this.courseMemberService.addUser(courseId!, user.id, this.getRoleFromPayload(args.payload))
        }
      )
    } else {
      const lmsCourse = await this.lmsCourseService.findLmsCourseFromLTI(args.payload['context_id'], args.lms.id)
      // Create course if course not found and user is teacher
      if (this.getRoleFromPayload(args.payload) === CourseMemberRoles.teacher && !lmsCourse.isPresent()) {
        const course = await this.CourseService.create({
          name: args.payload['context_title'],
          desc: `Cours PLaTOn rattaché à : ${args.payload['context_title']}`,
          ownerId: user.id,
        })
        courseId = course.id
        await this.lmsCourseService.create({
          lmsId: args.lms.id,
          lmsCourseId: args.payload['context_id'],
          courseId,
        })
        args.nextUrl = `/courses/${course.id}`
      } else if (!lmsCourse.isPresent() && this.getRoleFromPayload(args.payload) !== CourseMemberRoles.teacher) {
        args.nextUrl = '/courses/not-found'
      } else {
        courseId = lmsCourse.get().courseId
        args.nextUrl = `/courses/${lmsCourse.get().courseId}`
      }
    }

    if (courseId && args.payload['custom_groups'] && args.payload['custom_groups'].length > 0) {
      for (const group of args.payload['custom_groups'].split(',')) {
        await this.courseGroupService.addCourseGroup(courseId, group)
        await this.courseGroupMemberService.addCourseGroupMember(group, user.id)
      }
    }
  }
}
