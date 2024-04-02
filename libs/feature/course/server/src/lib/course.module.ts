import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@platon/core/server'
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
import { CourseEntity } from './course.entity'
import { CourseExpander } from './course.expander'
import { CourseLTIInterceptor } from './course.interceptor'
import { CourseService } from './course.service'
import { CourseSubscriber } from './course.subscriber'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseSectionController } from './section/section.controller'
import { CourseSectionEntity } from './section/section.entity'
import { CourseSectionService } from './section/section.service'

@Module({
  imports: [
    UserModule,
    FeatureLtiServerModule,
    FeatureResourceServerModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseMemberView,
      CourseMemberEntity,
      CourseSectionEntity,
      ActivityEntity,
      ActivityMemberView,
      ActivityMemberEntity,
      ActivityCorrectorView,
      ActivityCorrectorEntity,
      CourseGroupEntity,
      CourseGroupMemberEntity,
    ]),
  ],
  controllers: [
    CourseController,
    CourseMemberController,
    CourseSectionController,
    ActivityController,
    ActivityMemberController,
    ActivityCorrectorController,
    CourseGroupController,
    CourseGroupMemberController,
  ],
  providers: [
    CourseService,
    CourseExpander,
    CourseSubscriber,
    CourseLTIInterceptor,
    CoursePermissionsService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    ActivityCorrectorService,
    CourseNotificationService,
    CourseGroupService,
    CourseGroupMemberService,
  ],
  exports: [
    TypeOrmModule,

    CourseService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    ActivityCorrectorService,
    CourseNotificationService,
  ],
})
export class FeatureCourseServerModule {}
