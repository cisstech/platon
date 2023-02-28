import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseActivityEntity } from './activity/activity.entity';
import { CourseEntity } from './course.entity';
import { CourseService } from './course.service';
import { CourseSectionEntity } from './section/section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseSectionEntity,
      CourseActivityEntity
    ])
  ],
  controllers: [],
  providers: [CourseService],
  exports: [CourseService],
})
export class FeatureCourseServerModule { }
