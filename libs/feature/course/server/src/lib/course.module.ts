import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupModule } from '@platon/core/server';
import { CourseActivityEntity } from './activity/activity.entity';
import { CourseController } from './course.controller';
import { CourseEntity } from './course.entity';
import { CourseService } from './course.service';
import { CourseSubscriber } from './course.subscriber';
import { CourseMemberEntity } from './member/member.entity';
import { CourseSectionEntity } from './section/section.entity';

@Module({
  imports: [
    UserGroupModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseMemberEntity,
      CourseSectionEntity,
      CourseActivityEntity
    ])
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseSubscriber],
  exports: [CourseService],
})
export class FeatureCourseServerModule { }
