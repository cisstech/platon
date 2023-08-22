import { Injector } from '@angular/core'
import { Router } from '@angular/router'
import { ImgIcon } from '@cisstech/nge/ui/icon'
import {
  ACTIVITY_MEMBER_CREATION_NOTIFICATION,
  ActivityMemberCreationNotification,
  CORRECTION_AVAILABLE_NOTIFICATION,
  CORRECTION_PENDING_NOTIFICATION,
  CORRECTOR_CREATED_NOTIFICATION,
  CORRECTOR_REMOVED_NOTIFICATION,
  COURSE_MEMBER_CREATION_NOTIFICATION,
  CorrectionAvailableNotification,
  CorrectionPendingNotification,
  CorrectorCreatedNotification,
  CorrectorRemovedNotification,
  CourseMemberCreationNotification,
} from '@platon/feature/course/common'
import { NotificationParser, NotificationRenderer } from '@platon/feature/notification/browser'

export const CourseMemberCreationNotificationParser: NotificationParser<CourseMemberCreationNotification> = {
  support(notification): boolean {
    return notification.data.type === COURSE_MEMBER_CREATION_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous êtes désormais membre du cours “${notification.data.courseName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/courses/${notification.data.courseId}`])
        onClose()
      },
    }
  },
}

export const ActivityMemberCreationNotificationParser: NotificationParser<ActivityMemberCreationNotification> = {
  support(notification): boolean {
    return notification.data.type === ACTIVITY_MEMBER_CREATION_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous êtes désormais membre de l'activité “${notification.data.activityName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/courses/${notification.data.courseId}`])
        onClose()
      },
    }
  },
}

export const CorrectorCreatedNotificationParser: NotificationParser<CorrectorCreatedNotification> = {
  support(notification): boolean {
    return notification.data.type === CORRECTOR_CREATED_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous êtes désormais correcteur de l'activité “${notification.data.activityName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/courses/${notification.data.courseId}`])
        onClose()
      },
    }
  },
}

export const CorrectorRemovedNotificationParser: NotificationParser<CorrectorRemovedNotification> = {
  support(notification): boolean {
    return notification.data.type === CORRECTOR_REMOVED_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous n'êtes plus correcteur de l'activité “${notification.data.activityName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/courses/${notification.data.courseId}`])
        onClose()
      },
    }
  },
}

export const CorrectionPendingNotificationParser: NotificationParser<CorrectionPendingNotification> = {
  support(notification): boolean {
    return notification.data.type === CORRECTION_PENDING_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous une nouvelle copie en attente de correction sur l'activité “${notification.data.activityName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/player/correction/${notification.data.activityId}`])
        onClose()
      },
    }
  },
}

export const CorrectionAvailableNotificationParser: NotificationParser<CorrectionAvailableNotification> = {
  support(notification): boolean {
    return notification.data.type === CORRECTION_AVAILABLE_NOTIFICATION
  },
  renderer(notification, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous pouvez désormais accéder à la correction de l'activité “${notification.data.activityName}”`,
      onClick: ({ onClose }) => {
        router.navigate([`/player/activity/${notification.data.activityId}`])
        onClose()
      },
    }
  },
}

export const CourseNotificationParsers = [
  CourseMemberCreationNotificationParser,
  ActivityMemberCreationNotificationParser,
  CorrectorCreatedNotificationParser,
  CorrectorRemovedNotificationParser,
  CorrectionPendingNotificationParser,
  CorrectionAvailableNotificationParser,
]
