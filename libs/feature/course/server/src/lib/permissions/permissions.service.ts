import { Injectable } from '@nestjs/common'
import { ForbiddenResponse, NotFoundResponse, isTeacherRole } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { ActivityEntity } from '../activity/activity.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { ActivityGroupService } from '../activity-group/activity-group.service'

@Injectable()
export class CoursePermissionsService {
  constructor(
    private readonly courseMemberService: CourseMemberService,
    private readonly activityMemberService: ActivityMemberService,
    private readonly activityGroupService: ActivityGroupService
  ) {}

  async ensureCourseReadPermission(courseId: string, req: IRequest): Promise<void> {
    if (req.user.role != 'admin' && !(await this.courseMemberService.isMember(courseId, req.user.id))) {
      throw new ForbiddenResponse('You are not a member of this course')
    }
  }

  async ensureCourseWritePermission(courseId: string, req: IRequest): Promise<void> {
    if (!(await this.courseMemberService.isMember(courseId, req.user.id))) {
      throw new ForbiddenResponse('You are not a member of this course')
    }

    if (!isTeacherRole(req.user.role)) {
      throw new ForbiddenResponse('You are not a teacher of this course')
    }
  }

  async ensureActivityReadPermission(activity: ActivityEntity | null, req: IRequest): Promise<void> {
    if (!activity) {
      throw new NotFoundResponse(`Activity not found.`)
    }
    const isTeacher = isTeacherRole(req.user.role)
    const isPrivateMember = await this.activityMemberService.isPrivateMember(activity.id, req.user.id)
    const isInGroup = await this.activityGroupService.isUserInActivityGroup(activity.id, req.user.id)
    const isMember =
      (await this.activityMemberService.isMember(activity.id, req.user.id)) &&
      (await this.activityGroupService.numberOfGroups(activity.id)) === 0
    if (!isTeacher && !isPrivateMember && !isInGroup && !isMember) {
      throw new ForbiddenResponse('You are not a member of this activity')
    }
  }

  ensureActivityWritePermission(activity: ActivityEntity | null, req: IRequest): void {
    if (!activity) {
      throw new NotFoundResponse(`Activity not found.`)
    }
    if (activity.creatorId !== req.user.id) {
      throw new ForbiddenResponse('You are not the creator of this activity')
    }
  }
}
