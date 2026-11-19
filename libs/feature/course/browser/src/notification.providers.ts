import { Provider } from '@angular/core'
import { NOTIFICATION_PARSER } from '@platon/feature/notification/browser'
import { CourseNotificationParsers } from './providers/course-notification-parser.provider'

/** How the notification drawer of the current interface renders the notifications of courses. */
export const COURSE_NOTIFICATION_PROVIDERS: Provider[] = CourseNotificationParsers.map((parser) => ({
  provide: NOTIFICATION_PARSER,
  multi: true,
  useValue: parser,
}))
