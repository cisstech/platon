import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@platon/core/common';
import { Repository } from 'typeorm';
import { CourseActivityEntity } from './activity/activity.entity';
import { CourseEntity } from './course.entity';
import { CourseSectionEntity } from './section/section.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,

    @InjectRepository(CourseSectionEntity)
    private readonly sectionRepository: Repository<CourseSectionEntity>,

    @InjectRepository(CourseActivityEntity)
    private readonly activityRepository: Repository<CourseActivityEntity>,
  ) { }

  findCourseActivityById(id: string): Promise<CourseActivityEntity | undefined> {
    return this.activityRepository.findOne({
      where: { id }
    }) as Promise<CourseActivityEntity | undefined>;
  }


  canViewActivity(user: User, activity: CourseActivityEntity): Promise<boolean> {
    // TODO
    return Promise.resolve(true);
  }
}
