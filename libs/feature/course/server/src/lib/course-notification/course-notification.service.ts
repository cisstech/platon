import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
  ActivityClosedNotification,
  ActivityMemberCreationNotification,
  CorrectionAvailableNotification,
  CorrectionPendingNotification,
  CorrectorCreatedNotification,
  CorrectorRemovedNotification,
  COURSE_SIGNAL_NOTIFICATIONS,
  CourseMemberCreationNotification,
  EXERCISE_CHANGES_NOTIFICATION,
  ExerciseChangesNotification,
  MODERATION_ACTIVITY_CHANGES_NOTIFICATION,
  ModerationActivityChangesNotification,
} from '@platon/feature/course/common'
import { NotificationService } from '@platon/feature/notification/server'
import { DataSource } from 'typeorm'
import { ActivityCorrectorView } from '../activity-corrector/activity-corrector.view'
import { ActivityMemberView } from '../activity-member/activity-member.view'
import { CourseMemberView } from '../course-member/course-member.view'
import { PlayActivityOuput, PlayerExercise } from '@platon/feature/player/common'
import { CourseMonitorPresenceService } from '../course-monitor-presence/course-monitor-presence.service'
@Injectable()
export class CourseNotificationService implements OnModuleInit {
  private readonly logger = new Logger(CourseNotificationService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly monitorPresenceService: CourseMonitorPresenceService
  ) {}

  onModuleInit(): void {
    this.notificationService.declareSignals(...COURSE_SIGNAL_NOTIFICATIONS)
  }

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

  async notifyActivityBeingClosed(activityId: string): Promise<void> {
    try {
      const members = (await this.dataSource.query(
        `
      SELECT DISTINCT user_id
      FROM "Sessions"
      WHERE activity_id = $1
        `,
        [activityId]
      )) as { user_id: string }[]

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
        resource.name as "activityName",
        course.id as "courseId",
        course.name as "courseName"
      FROM "Activities" activity
      INNER JOIN "Courses" course ON course.id = activity.course_id
      JOIN "Resources" resource ON resource.id = (activity.source->>'resource')::uuid
      WHERE activity.id = $1
      ;
    `,
        [activityId]
      )) as Projection[]

      await Promise.all(
        members.map((member) =>
          this.notificationService.sendToUser<ActivityClosedNotification>(member.user_id, {
            type: 'ACTIVITY-CLOSED',
            activityId: results[0].activityId,
            activityName: results[0].activityName,
            courseId: results[0].courseId,
            courseName: results[0].courseName,
          })
        )
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyExerciseChanges(userId: string, sessionId: string, changes: PlayerExercise): Promise<void> {
    try {
      // Get session and activity information
      const sessionInfo = (await this.dataSource.query(
        `
        SELECT s.id as session_id, s.activity_id, act.course_id
        FROM "Sessions" AS s
        JOIN "Activities" AS act ON act.id = s.activity_id
        WHERE s.id = $1
        `,
        [sessionId]
      )) as { session_id: string; activity_id: string; course_id: string }[]

      if (!sessionInfo.length) {
        this.logger.warn(`No session found with ID: ${sessionId}`)
        return
      }

      const activityId = sessionInfo[0].activity_id

      // Get active monitoring teachers for this activity
      const activeMonitors = this.monitorPresenceService.getActiveMonitoringUsers(activityId)

      if (activeMonitors.length > 0) {
        this.logger.log(
          `Sending exercise changes notifications to ${activeMonitors.length} active monitoring teachers for activity ${activityId}`
        )

        await this.notificationService.sendToAllUsers<ExerciseChangesNotification>(activeMonitors, {
          type: EXERCISE_CHANGES_NOTIFICATION,
          userId: userId,
          changes: {
            ...changes,
          },
        })
      } else {
        this.logger.log(`No active monitors for activity ${activityId}, skipping exercise changes notification`)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  async notifyModerationActivityChanges(userId: string, activity: PlayActivityOuput): Promise<void> {
    try {
      await this.notificationService.sendToUser<ModerationActivityChangesNotification>(userId, {
        type: MODERATION_ACTIVITY_CHANGES_NOTIFICATION,
        activity: activity.activity,
      })
    } catch (error) {
      this.logger.error(error)
    }
  }
}
