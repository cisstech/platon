import { Provider } from '@angular/core'
import { ActivityCorrectorProvider } from './models/activity-corrector.provider'
import { ActivityGroupProvider } from './models/activity-group.provider'
import { ActivityMemberProvider } from './models/activity-member.provider'
import { ActivityProvider } from './models/activity-provider'
import { CourseGroupProvider } from './models/course-group-provider'
import { CourseMemberProvider } from './models/course-member-provider'
import { CourseProvider } from './models/course-provider'
import { CourseSectionProvider } from './models/course-section-provider'
import { RemoteActivityCorrectorProvider } from './providers/remote-activity-corrector.provider'
import { RemoteActivityGroupProvider } from './providers/remote-activity-group.provider'
import { RemoteActivityMemberProvider } from './providers/remote-activity-member.provider'
import { RemoteActivityProvider } from './providers/remote-activity.provider'
import { RemoteCourseGroupProvider } from './providers/remote-course-group.provider'
import { RemoteCourseMemberProvider } from './providers/remote-course-member.provider'
import { RemoteCourseSectionProvider } from './providers/remote-course-section.provider'
import { RemoteCourseProvider } from './providers/remote-course.provider'
import { CourseDemoProvider } from './models/course-demo-provider'
import { RemoteCourseDemoProvider } from './providers/remote-course-demo.provider'
import { CourseMonitorPresenceProvider } from './models/course-monitor-presence-provider'
import { RemoteCourseMonitorPresenceProvider } from './providers/remote-course-monitor-presence.provider'

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
  { provide: CourseMonitorPresenceProvider, useClass: RemoteCourseMonitorPresenceProvider },
  { provide: CourseDemoProvider, useClass: RemoteCourseDemoProvider },
  { provide: CourseGroupProvider, useClass: RemoteCourseGroupProvider },
  { provide: ActivityGroupProvider, useClass: RemoteActivityGroupProvider },
]
