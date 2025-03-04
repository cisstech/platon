import { Injectable, Logger } from '@nestjs/common'
import { ActivityCorrectorService } from '../activity-corrector/activity-corrector.service'
import { OnEvent } from '@nestjs/event-emitter'
import {
  ON_CORRECT_ACTIVITY_EVENT,
  ON_TERMINATE_ACTIVITY_EVENT,
  OnCorrectActivityEventPayload,
  OnTerminateActivityEventPayload,
} from './activity.event'
import { CourseNotificationService } from '../course-notification/course-notification.service'

@Injectable()
export class ActivityListeners {
  private readonly logger = new Logger(ActivityListeners.name)

  constructor(
    private readonly activityCorrectorService: ActivityCorrectorService,
    private readonly notificationService: CourseNotificationService
  ) {}

  @OnEvent(ON_CORRECT_ACTIVITY_EVENT)
  protected onCorrectActivity(payload: OnCorrectActivityEventPayload) {
    const { userId, activity } = payload
    this.notificationService.notifyUserAboutCorrection(activity.id, userId).catch((error) => {
      this.logger.error('Failed to send notification', error)
    })
  }

  @OnEvent(ON_TERMINATE_ACTIVITY_EVENT)
  protected async onTerminateActivity(payload: OnTerminateActivityEventPayload): Promise<void> {
    const { activity } = payload
    this.notificationService
      .notifyCorrectorsAboutPending(await this.activityCorrectorService.findViews(activity.id))
      .catch((error) => {
        this.logger.error('Failed to send notification', error)
      })
  }
}
