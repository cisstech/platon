import { Injectable } from '@nestjs/common'
import { ForbiddenResponse, NotFoundResponse, isTeacherRole } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { ActivityEntity } from '../activity/activity.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { ActivityGroupService } from '../activity-group/activity-group.service'
import { ActivityService } from '../activity/activity.service'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { CourseGroupService } from '../course-group/course-group.service'

@Injectable()
export class CoursePermissionsService {
  constructor(
    private readonly courseMemberService: CourseMemberService,
    private readonly activityMemberService: ActivityMemberService,
    private readonly activityGroupService: ActivityGroupService,
    private readonly activityService: ActivityService,
    private readonly courseGroupService: CourseGroupService
  ) {}

  async ensureCourseReadPermission(courseId: string, req: IRequest): Promise<void> {
    if (req.user.role != 'admin' && !(await this.courseMemberService.isMember(courseId, req.user.id))) {
      throw new ForbiddenResponse('You are not a member of this course')
    }
  }

  async ensureCourseWritePermission(courseId: string, req: IRequest): Promise<void> {
    if (!(await this.courseMemberService.hasWritePermission(courseId, req.user))) {
      throw new ForbiddenResponse('You cannot modify this course')
    }
  }

  /** A group of the course, read by its members; a group of another course is not found. */
  async ensureGroupReadPermission(courseId: string, groupId: string, req: IRequest): Promise<CourseGroupEntity> {
    await this.ensureCourseReadPermission(courseId, req)
    return this.groupOf(courseId, groupId)
  }

  /** A group of the course, written by who may change the course; a group of another course is not found. */
  async ensureGroupWritePermission(courseId: string, groupId: string, req: IRequest): Promise<CourseGroupEntity> {
    await this.ensureCourseWritePermission(courseId, req)
    return this.groupOf(courseId, groupId)
  }

  async ensureActivityReadPermission(activity: string | ActivityEntity, req: IRequest): Promise<void> {
    const activityEntity =
      typeof activity === 'string'
        ? (await this.activityService.findByActivityId(activity)).orElseThrow(
            () => new NotFoundResponse(`Activity not found.`)
          )
        : activity
    const isTeacher = isTeacherRole(req.user.role)
    const isPrivateMember = await this.activityMemberService.isPrivateMember(activityEntity.id, req.user.id)
    const isInGroup = await this.activityGroupService.isUserInActivityGroup(activityEntity.id, req.user.id)
    const isMember =
      (await this.activityMemberService.isMember(activityEntity.id, req.user.id)) &&
      (await this.activityGroupService.numberOfGroups(activityEntity.id)) === 0
    if (!isTeacher && !isPrivateMember && !isInGroup && !isMember) {
      throw new ForbiddenResponse('You are not a member of this activity')
    }
  }

  async ensureActivityWritePermission(activity: string | ActivityEntity, req: IRequest): Promise<void> {
    const activityEntity =
      typeof activity === 'string'
        ? (await this.activityService.findByActivityId(activity)).orElseThrow(
            () => new NotFoundResponse(`Activity not found.`)
          )
        : activity
    if (activityEntity.creatorId == req.user.id) return
    await this.ensureCourseWritePermission(activityEntity.courseId, req)
  }

  private async groupOf(courseId: string, groupId: string): Promise<CourseGroupEntity> {
    const group = await this.courseGroupService.findInCourse(courseId, groupId)
    if (!group) {
      throw new NotFoundResponse(`Group not found in this course: ${groupId}`)
    }
    return group
  }
}
