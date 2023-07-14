import { Injector } from '@angular/core'
import { Router } from '@angular/router'
import { ImgIcon } from '@cisstech/nge/ui/icon'
import { COURSE_MEMBER_CREATION_NOTIFICATION, CourseMemberCreationNotification } from '@platon/feature/course/common'
import { NotificationParser, NotificationRenderer } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'

export const CourseMemberCreationNotificationParser: NotificationParser = {
  support(notification: Notification<CourseMemberCreationNotification>): boolean {
    return notification.data.type === COURSE_MEMBER_CREATION_NOTIFICATION
  },
  renderer(notification: Notification<CourseMemberCreationNotification>, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    return {
      icon: new ImgIcon(`/assets/images/courses/course.svg`),
      content: `Vous êtes désormais membre du cours ${notification.data.courseName}`,
      onClick: ({ onClose }) => {
        router.navigate([`/courses/${notification.data.courseId}`])
        onClose()
      },
    }
  },
}
