/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, User } from '@platon/core/common';
import { courseActivityState, CreateCourseActivity, UpdateCourseActivity } from '@platon/feature/course/common';
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

  async findById(courseId: string, id: string, user: User): Promise<Optional<CourseActivityEntity>> {
    const qb = this.repository.createQueryBuilder('activity')
      .where(`course_id = :courseId`, { courseId })
      .andWhere(`activity.id = :id`, { id })
      .leftJoinAndSelect(
        'PlayerSessions',
        'session',
        'session.parent_id IS NULL AND session.course_activity_id = activity.id AND session.user_id = :userId',
        {
          userId: user.id
        }
      )

    const { entities, raw: raws } = await qb.getRawAndEntities()
    entities.forEach(entity => {
      this.calculateVirtualColumns(entity, raws.find(r => r.activity_id === entity.id));
    });

    return Optional.ofNullable(entities.pop());
  }

  async ofCourse(courseId: string, user: User): Promise<[CourseActivityEntity[], number]> {
    const qb = this.repository.createQueryBuilder('activity')
      .where(`course_id = :courseId`, { courseId })
      .leftJoinAndSelect(
        'PlayerSessions',
        'session',
        'session.parent_id IS NULL AND session.course_activity_id = activity.id AND session.user_id = :userId',
        {
          userId: user.id
        }
      )

    const { entities, raw: raws } = await qb.getRawAndEntities()
    entities.forEach(entity => {
      this.calculateVirtualColumns(entity, raws.find(r => r.activity_id === entity.id));
    });
    return [entities, entities.length]
  }

  async create(activity: Partial<CourseActivityEntity>): Promise<CourseActivityEntity> {
    return this.calculateVirtualColumns(
      await this.repository.save({
        ...activity,
      })
    );
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
    return this.calculateVirtualColumns(
      await this.repository.save(activity)
    );
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

  private calculateVirtualColumns(entity: CourseActivityEntity, raw?: any) {
    // TODO move close to answer module
    Object.assign(entity, {
      state: courseActivityState(entity)
    });

    if (raw) {
      const navigation = raw.session_variables?.navigation;
      if (navigation?.exercises) {
        const started = navigation.exercises.filter((e: any) => e.state !== 'NOT_STARTED').length;
        const graded = navigation.exercises.filter((e: any) => !['NOT_STARTED', 'STARTED'].includes(e.state)).length;
        entity.progression = (100 * graded + 10 * (started - graded)) / navigation.exercises.length;
      }
    }

    return entity
  }

}
