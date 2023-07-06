import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthService, UserModule } from '@platon/core/server';
import { FeatureNotificationServerModule } from '@platon/feature/notification/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { ActivityCorrectorController } from './activity-corrector/activity-corrector.controller';
import { ActivityCorrectorEntity } from './activity-corrector/activity-corrector.entity';
import { ActivityCorrectorService } from './activity-corrector/activity-corrector.service';
import { ActivityCorrectorView } from './activity-corrector/activity-corrector.view';
import { ActivityMemberController } from './activity-member/activity-member.controller';
import { ActivityMemberEntity } from './activity-member/activity-member.entity';
import { ActivityMemberService } from './activity-member/activity-member.service';
import { ActivityMemberView } from './activity-member/activity-member.view';
import { ActivityController } from './activity/activity.controller';
import { ActivityEntity } from './activity/activity.entity';
import { ActivityService } from './activity/activity.service';
import { CourseMemberController } from './course-member/course-member.controller';
import { CourseMemberEntity } from './course-member/course-member.entity';
import { CourseMemberService } from './course-member/course-member.service';
import { CourseMemberView } from './course-member/course-member.view';
import { CourseNotificationService } from './course-notification/course-notification.service';
import { CourseController } from './course.controller';
import { CourseEntity } from './course.entity';
import { CourseService } from './course.service';
import { CourseSubscriber } from './course.subscriber';
import { CourseSectionController } from './section/section.controller';
import { CourseSectionEntity } from './section/section.entity';
import { CourseSectionService } from './section/section.service';
import { CourseDemoController } from './course-demo/course-demo.controller';
import { CourseDemoService } from './course-demo/course-demo.service';
import { CourseDemoEntity } from './course-demo/course-demo.entity';

@Module({
  imports: [
    UserModule,
    FeatureResourceServerModule,
    FeatureNotificationServerModule,
    AuthModule,
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
      CourseDemoEntity,
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
  ],
  providers: [
    CourseService,
    CourseSubscriber,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    ActivityCorrectorService,

    CourseNotificationService,
    CourseDemoService,
  ],
  exports: [
    TypeOrmModule,

    CourseService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    CourseDemoService,
  ],
})
export class FeatureCourseServerModule {}
