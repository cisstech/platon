import { Provider } from '@angular/core'
import { NOTIFICATION_PARSER } from '@platon/feature/notification/browser'
import { ActivityCorrectorProvider } from './models/activity-corrector.provider'
import { ActivityMemberProvider } from './models/activity-member.provider'
import { ActivityProvider } from './models/activity-provider'
import { CourseMemberProvider } from './models/course-member-provider'
import { CourseProvider } from './models/course-provider'
import { CourseSectionProvider } from './models/course-section-provider'
import { CourseNotificationParsers } from './providers/course-notification-parser.provider'
import { RemoteActivityCorrectorProvider } from './providers/remote-activity-corrector.provider'
import { RemoteActivityMemberProvider } from './providers/remote-activity-member.provider'
import { RemoteActivityProvider } from './providers/remote-activity.provider'
import { RemoteCourseMemberProvider } from './providers/remote-course-member.provider'
import { RemoteCourseSectionProvider } from './providers/remote-course-section.provider'
import { RemoteCourseProvider } from './providers/remote-course.provider'
import { CourseDemoProvider } from './models/course-demo-provider'
import { RemoteCourseDemoProvider } from './providers/remote-course-demo.provider'
import { CourseGroupProvider } from './models/course-group-provider'
import { RemoteCourseGroupProvider } from './providers/remote-course-group.provider'

export const COURSE_PROVIDERS: Provider[] = [
  { provide: ActivityProvider, useClass: RemoteActivityProvider },
  { provide: ActivityMemberProvider, useClass: RemoteActivityMemberProvider },
  {
    provide: ActivityCorrectorProvider,
    useClass: RemoteActivityCorrectorProvider,
  },

  { provide: CourseProvider, useClass: RemoteCourseProvider },
  { provide: CourseMemberProvider, useClass: RemoteCourseMemberProvider },
  { provide: CourseSectionProvider, useClass: RemoteCourseSectionProvider },
  { provide: CourseDemoProvider, useClass: RemoteCourseDemoProvider },
  { provide: CourseGroupProvider, useClass: RemoteCourseGroupProvider },

  ...CourseNotificationParsers.map((provider) => ({
    provide: NOTIFICATION_PARSER,
    multi: true,
    useValue: provider,
  })),
]
