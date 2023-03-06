/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { CreateCourseActivity, UpdateCourseActivity } from '@platon/feature/course/common';
import { ResourceFileService } from '@platon/feature/resource/server';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseMemberService } from '../member/member.service';
import { CourseActivityEntity } from './activity.entity';

@Injectable()
export class CourseActivityService {
  constructor(
    private readonly fileService: ResourceFileService,
    private readonly memberService: CourseMemberService,

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

  async create(activity: CourseActivityEntity): Promise<CourseActivityEntity> {
    return this.repository.save({
      ...activity,
      order: 0
    });
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



  async fromInput(input: CreateCourseActivity | UpdateCourseActivity): Promise<CourseActivityEntity> {
    const { members, ...props } = input;

    const activity = new CourseActivityEntity()

    if ('resourceId' in props) {
      const [source] = await this.fileService.compile(props.resourceId, props.resourceVersion);
      activity.source = source;
      delete (props as any).resourceId;
      delete (props as any).resourceVersion;
    }

    Object.assign(activity, props);

    if (members) {
      activity.members = (
        await Promise.all(
          members.map(async memberId => {
            const optional = await this.memberService.findById(activity.courseId, memberId);
            return optional.orElseThrow(() => new NotFoundResponse(`CourseMember not found: ${memberId}`));
          })
        )
      );
    }

    return activity
  }

}
