import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@platon/core/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { ActivityCorrectorController } from './activity-corrector/activity-corrector.controller';
import { ActivityCorrectorEntity } from './activity-corrector/activity-corrector.entity';
import { ActivityCorrectorService } from './activity-corrector/activity-corrector.service';
import { ActivityMemberController } from './activity-member/activity-member.controller';
import { ActivityMemberEntity } from './activity-member/activity-member.entity';
import { ActivityMemberService } from './activity-member/activity-member.service';
import { ActivityController } from './activity/activity.controller';
import { ActivityEntity } from './activity/activity.entity';
import { ActivityService } from './activity/activity.service';
import { CourseMemberController } from './course-member/course-member.controller';
import { CourseMemberEntity } from './course-member/course-member.entity';
import { CourseMemberService } from './course-member/course-member.service';
import { CourseController } from './course.controller';
import { CourseEntity } from './course.entity';
import { CourseService } from './course.service';
import { CourseSubscriber } from './course.subscriber';
import { CourseSectionController } from './section/section.controller';
import { CourseSectionEntity } from './section/section.entity';
import { CourseSectionService } from './section/section.service';

@Module({
  imports: [
    UserModule,
    FeatureResourceServerModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseMemberEntity,
      CourseSectionEntity,
      ActivityEntity,
      ActivityMemberEntity,
      ActivityCorrectorEntity,
    ])
  ],
  controllers: [
    CourseController,
    CourseMemberController,
    CourseSectionController,
    ActivityController,
    ActivityMemberController,
    ActivityCorrectorController,
  ],
  providers: [
    CourseService,
    CourseSubscriber,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
    ActivityCorrectorService
  ],
  exports: [
    TypeOrmModule,

    CourseService,

    CourseMemberService,
    CourseSectionService,
    ActivityService,
    ActivityMemberService,
  ],
})
export class FeatureCourseServerModule { }
