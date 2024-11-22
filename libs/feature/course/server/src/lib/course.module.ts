import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule, UserModule } from '@platon/core/server'
import { FeatureLtiServerModule } from '@platon/feature/lti/server'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'
import { ActivityCorrectorController } from './activity-corrector/activity-corrector.controller'
import { ActivityCorrectorEntity } from './activity-corrector/activity-corrector.entity'
import { ActivityCorrectorService } from './activity-corrector/activity-corrector.service'
import { ActivityCorrectorView } from './activity-corrector/activity-corrector.view'
import { ActivityMemberController } from './activity-member/activity-member.controller'
import { ActivityMemberEntity } from './activity-member/activity-member.entity'
import { ActivityMemberService } from './activity-member/activity-member.service'
import { ActivityMemberView } from './activity-member/activity-member.view'
import { ActivityController } from './activity/activity.controller'
import { ActivityEntity } from './activity/activity.entity'
import { ActivityService } from './activity/activity.service'
import { CourseGroupMemberController } from './course-group-member/course-group-member.controller'
import { CourseGroupMemberEntity } from './course-group-member/course-group-member.entity'
import { CourseGroupMemberService } from './course-group-member/course-group-member.service'
import { CourseGroupController } from './course-group/course-group.controller'
import { CourseGroupEntity } from './course-group/course-group.entity'
import { CourseGroupService } from './course-group/course-group.service'
import { CourseMemberController } from './course-member/course-member.controller'
import { CourseMemberEntity } from './course-member/course-member.entity'
import { CourseMemberService } from './course-member/course-member.service'
import { CourseMemberView } from './course-member/course-member.view'
import { CourseNotificationService } from './course-notification/course-notification.service'
import { CourseController } from './course.controller'
import { CourseEntity } from './entites/course.entity'
import { CourseExpander } from './course.expander'
import { CourseLTIInterceptor } from './course.interceptor'
import { CourseService } from './services/course.service'
import { CourseSubscriber } from './course.subscriber'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseSectionController } from './section/section.controller'
import { CourseSectionEntity } from './section/section.entity'
import { CourseSectionService } from './section/section.service'
import { CourseDemoController } from './course-demo/course-demo.controller'
import { CourseDemoService } from './course-demo/course-demo.service'
import { CourseDemoEntity } from './course-demo/course-demo.entity'
import { ActivityGroupEntity } from './activity-group/activity-group.entity'
import { ActivityGroupController } from './activity-group/activity-group.controller'
import { ActivityGroupService } from './activity-group/activity-group.service'
import { LmsCourseEntity } from './entites/lms-course.entity'
import { LmsCourseService } from './services/lms-course.service'
import { ActivityListeners } from './activity/activity.listeners'

@Module({
  imports: [
    UserModule,
    FeatureLtiServerModule,
    FeatureResourceServerModule,
    AuthModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      LmsCourseEntity,
      CourseMemberView,
      CourseMemberEntity,
      CourseSectionEntity,
      ActivityEntity,
      ActivityMemberView,
      ActivityMemberEntity,
      ActivityCorrectorView,
      ActivityCorrectorEntity,
      CourseDemoEntity,
      CourseGroupEntity,
      CourseGroupMemberEntity,
      ActivityGroupEntity,
    ]),
  ],
  controllers: [
    CourseController,
    CourseMemberController,
    CourseSectionController,
    ActivityController,
    ActivityMemberController,
    ActivityCorrectorController,
    CourseDemoController,
    CourseGroupController,
    CourseGroupMemberController,
    ActivityGroupController,
  ],
  providers: [
    CourseService,
    LmsCourseService,
    CourseExpander,
    CourseSubscriber,
    CourseLTIInterceptor,
    CoursePermissionsService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityListeners,
    ActivityMemberService,
    ActivityCorrectorService,
    CourseNotificationService,
    CourseDemoService,
    CourseGroupService,
    CourseGroupMemberService,
    ActivityGroupService,
  ],
  exports: [
    TypeOrmModule,

    CourseService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    CourseDemoService,
    ActivityCorrectorService,
    CourseNotificationService,
    ActivityGroupService,
  ],
})
export class FeatureCourseServerModule {}
