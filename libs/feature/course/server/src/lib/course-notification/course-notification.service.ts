import { Injectable, Logger } from '@nestjs/common'
import { UserGroupService } from '@platon/core/server'
import {
  CorrectionAvailableNotification,
  CorrectionPendingNotification,
  CorrectorCreatedNotification,
  CorrectorRemovedNotification,
  CourseMemberCreationNotification,
} from '@platon/feature/course/common'
import { NotificationService } from '@platon/feature/notification/server'
import { DataSource } from 'typeorm'
import { ActivityCorrectorView } from '../activity-corrector/activity-corrector.view'
import { CourseMemberEntity } from '../course-member/course-member.entity'
import { CourseService } from '../course.service'

@Injectable()
export class CourseNotificationService {
  private readonly logger = new Logger(CourseNotificationService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
    private readonly useGroupService: UserGroupService,
    private readonly notificationService: NotificationService
  ) {}

  async notifyCourseMemberBeingCreated(member: CourseMemberEntity) {
    try {
      const course = (await this.courseService.findById(member.courseId)).get()

      const userIds: string[] = []
      if (member.groupId) {
        const users = await this.useGroupService.listMembers(member.groupId)
        userIds.push(...users.map((user) => user.id))
      }

      if (member.userId) {
        userIds.push(member.userId)
      }

      return this.notificationService.sendToAllUsers<CourseMemberCreationNotification>(userIds, {
        type: 'COURSE-MEMBER-CREATION',
        courseId: course.id,
        courseName: course.name,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyCorrectorsAboutPending(activityId: string): Promise<void> {
    try {
      type Projection = {
        activityId: string
        activityName: string
        courseId: string
        courseName: string
        correctorId: string
        correctorName: string
      }

      const correctors = (await this.dataSource.query(
        `
      SELECT
        activity.id as "activityId",
        activity.source->'variables'->>'title' as "activityName",
        course.id as "courseId",
        course.name as "courseName",
        corrector.id as "correctorId",
        corrector.username as "correctorName"
      FROM "Activities" activity
      INNER JOIN "Courses" course ON course.id = activity.course_id
      INNER JOIN "ActivityCorrectorView" corrector ON corrector.activity_id = activity.id
      WHERE activity.id = $1
      ;
    `,
        [activityId]
      )) as Projection[]

      await Promise.all(
        correctors.map((corrector) =>
          this.notificationService.sendToUser<CorrectionPendingNotification>(corrector.correctorId, {
            type: 'CORRECTION-PENDING',
            activityId: corrector.activityId,
            activityName: corrector.activityName,
            courseId: corrector.courseId,
            courseName: corrector.courseName,
          })
        )
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyUserAboutCorrection(activityId: string, userId: string): Promise<void> {
    try {
      type Projection = {
        activityId: string
        activityName: string
        courseId: string
        courseName: string
      }

      const results = (await this.dataSource.query(
        `
      SELECT
        activity.id as "activityId",
        activity.source->'variables'->>'title' as "activityName",
        course.id as "courseId",
        course.name as "courseName"
      FROM "Activities" activity
      INNER JOIN "Courses" course ON course.id = activity.course_id
      WHERE activity.id = $1
      ;
    `,
        [activityId]
      )) as Projection[]

      if (!results.length) {
        return
      }

      await this.notificationService.sendToUser<CorrectionAvailableNotification>(userId, {
        type: 'CORRECTION-AVAILABLE',
        activityId: results[0].activityId,
        activityName: results[0].activityName,
        courseId: results[0].courseId,
        courseName: results[0].courseName,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyCorrectorsBeingCreated(correctors: ActivityCorrectorView[]): Promise<void> {
    try {
      await Promise.all(
        correctors.map((corrector) =>
          this.notificationService.sendToUser<CorrectorCreatedNotification>(corrector.id, {
            type: 'CORRECTOR-CREATED',
            activityId: corrector.activityId,
            activityName: corrector.activityName,
            courseId: corrector.courseId,
            courseName: corrector.courseName,
          })
        )
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyCorrectorsBeingRemoved(correctors: ActivityCorrectorView[]): Promise<void> {
    try {
      await Promise.all(
        correctors.map((corrector) =>
          this.notificationService.sendToUser<CorrectorRemovedNotification>(corrector.id, {
            type: 'CORRECTOR-REMOVED',
            activityId: corrector.activityId,
            activityName: corrector.activityName,
            courseId: corrector.courseId,
            courseName: corrector.courseName,
          })
        )
      )
    } catch (error) {
      this.logger.error(error)
    }
  }
}
