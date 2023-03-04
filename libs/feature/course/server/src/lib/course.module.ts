import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@platon/core/server';
import { CourseActivityController } from './activity/activity.controller';
import { CourseActivityEntity } from './activity/activity.entity';
import { CourseActivityService } from './activity/activity.service';
import { CourseController } from './course.controller';
import { CourseEntity } from './course.entity';
import { CourseService } from './course.service';
import { CourseSubscriber } from './course.subscriber';
import { CourseMemberController } from './member/member.controller';
import { CourseMemberEntity } from './member/member.entity';
import { CourseMemberService } from './member/member.service';
import { CourseSectionController } from './section/section.controller';
import { CourseSectionEntity } from './section/section.entity';
import { CourseSectionService } from './section/section.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseMemberEntity,
      CourseSectionEntity,
      CourseActivityEntity
    ])
  ],
  controllers: [
    CourseController,
    CourseMemberController,
    CourseSectionController,
    CourseActivityController,
  ],
  providers: [
    CourseService,
    CourseSubscriber,

    CourseMemberService,
    CourseSectionService,
    CourseActivityService,
  ],
  exports: [CourseService],
})
export class FeatureCourseServerModule { }
