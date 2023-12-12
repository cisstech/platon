import { Injectable, Logger } from '@nestjs/common'
import {
  ActivityMemberCreationNotification,
  CorrectionAvailableNotification,
  CorrectionPendingNotification,
  CorrectorCreatedNotification,
  CorrectorRemovedNotification,
  CourseMemberCreationNotification,
} from '@platon/feature/course/common'
import { NotificationService } from '@platon/feature/notification/server'
import { DataSource } from 'typeorm'
import { ActivityCorrectorView } from '../activity-corrector/activity-corrector.view'
import { ActivityMemberView } from '../activity-member/activity-member.view'
import { CourseMemberView } from '../course-member/course-member.view'

@Injectable()
export class CourseNotificationService {
  private readonly logger = new Logger(CourseNotificationService.name)

  constructor(private readonly dataSource: DataSource, private readonly notificationService: NotificationService) {}

  async notifyCourseMemberBeingCreated(members: CourseMemberView[]) {
    try {
      await Promise.all(
        members.map((member) =>
          this.notificationService.sendToUser<CourseMemberCreationNotification>(member.id, {
            type: 'COURSE-MEMBER-CREATION',
            courseId: member.courseId,
            courseName: member.courseName,
          })
        )
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyActivityMemberBeingCreated(members: ActivityMemberView[]) {
    try {
      await Promise.all(
        members.map((member) =>
          this.notificationService.sendToUser<ActivityMemberCreationNotification>(member.id, {
            type: 'ACTIVITY-MEMBER-CREATION',
            courseId: member.courseId,
            courseName: member.courseName,
            activityId: member.activityId,
            activityName: member.activityName,
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

  async notifyCorrectorsAboutPending(correctors: ActivityCorrectorView[]): Promise<void> {
    try {
      await Promise.all(
        correctors.map((corrector) =>
          this.notificationService.sendToUser<CorrectionPendingNotification>(corrector.id, {
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
