import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseActivityEntity } from './activity.entity';

@Injectable()
export class CourseActivityService {
  constructor(
    @InjectRepository(CourseActivityEntity)
    private readonly repository: Repository<CourseActivityEntity>
  ) { }

  async findById(courseId: string, id: string): Promise<Optional<CourseActivityEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { courseId, id } })
    );
  }

  async ofCourse(courseId: string): Promise<[CourseActivityEntity[], number]> {
    return this.repository.findAndCount({
      where: { courseId },
      order: {
        order: { direction: 'ASC' }
      }
    });
  }

  async ofSection(courseId: string, sectionId: string): Promise<[CourseActivityEntity[], number]> {
    return this.repository.findAndCount({
      where: { courseId, sectionId },
      order: {
        order: { direction: 'ASC' }
      }
    });
  }

  async create(activity: Partial<CourseActivityEntity>): Promise<CourseActivityEntity> {
    return this.repository.save(activity);
  }

  async update(
    courseId: string,
    activityId: string,
    changes: Partial<CourseActivityEntity>
  ): Promise<CourseActivityEntity> {
    const activity = await this.repository.findOne({ where: { courseId, id: activityId } })
    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }
    Object.assign(activity, changes);
    return this.repository.save(activity);
  }

  async delete(courseId: string, activityId: string) {
    return this.repository.delete({ courseId, id: activityId });
  }
}
