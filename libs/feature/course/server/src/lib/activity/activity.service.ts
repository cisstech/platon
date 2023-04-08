/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, User } from '@platon/core/common';
import { ActivityFilters, CreateActivity, UpdateActivity, calculateActivityState } from '@platon/feature/course/common';
import { ResourceFileService } from '@platon/feature/resource/server';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { ActivityEntity } from './activity.entity';

interface Participant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}


@Injectable()
export class ActivityService {
  constructor(
    private readonly fileService: ResourceFileService,

    @InjectRepository(ActivityEntity)
    private readonly repository: Repository<ActivityEntity>
  ) { }

  async findById(courseId: string, id: string, user: User): Promise<Optional<ActivityEntity>> {
    const qb = this.repository.createQueryBuilder('activity')
      .where(`course_id = :courseId`, { courseId })
      .andWhere(`activity.id = :id`, { id })
      .leftJoinAndSelect(
        'PlayerSessions',
        'session',
        'session.parent_id IS NULL AND session.activity_id = activity.id AND session.user_id = :userId',
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

  async ofCourse(courseId: string, user: User, filters?: ActivityFilters): Promise<[ActivityEntity[], number]> {
    const qb = this.repository.createQueryBuilder('activity')
      .where(`course_id = :courseId`, { courseId })
      .leftJoinAndSelect(
        'PlayerSessions',
        'session',
        'session.parent_id IS NULL AND session.activity_id = activity.id AND session.user_id = :userId',
        {
          userId: user.id
        }
      )

    if (filters?.sectionId) {
      qb.andWhere(`section_id = :sectionId`, { sectionId: filters.sectionId })
    }

    const { entities, raw: raws } = await qb.getRawAndEntities()
    entities.forEach(entity => {
      this.calculateVirtualColumns(entity, raws.find(r => r.activity_id === entity.id));
    });
    return [entities, entities.length]
  }

  async create(activity: Partial<ActivityEntity>): Promise<ActivityEntity> {
    return this.calculateVirtualColumns(
      await this.repository.save({
        ...activity,
      })
    );
  }

  async update(
    courseId: string,
    activityId: string,
    changes: Partial<ActivityEntity>
  ): Promise<ActivityEntity> {
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

  async fromInput(input: CreateActivity | UpdateActivity): Promise<ActivityEntity> {
    const activity = new ActivityEntity()

    if ('resourceId' in input) {
      const [source] = await this.fileService.compile(input.resourceId, input.resourceVersion);
      activity.source = source;
      delete (input as any).resourceId;
      delete (input as any).resourceVersion;
    }

    Object.assign(activity, input);

    return activity
  }


  async listUsers(
    courseId: string,
    activityId: string,
  ): Promise<Participant[]> {
    const activityMembers = (await this.repository.query(`
      SELECT DISTINCT COALESCE(activity_member.user_id, course_member.user_id, gp.user_id) as id,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email
      FROM "ActivityMembers" activity_member
      INNER JOIN "CourseMembers" course_member ON course_member.id = activity_member.member_id
      LEFT JOIN "UserGroupsUsers" gp ON activity_member.user_id IS NULL AND gp.group_id = course_member.group_id
      INNER JOIN "Users" u ON u.id=activity_member.user_id OR u.id = course_member.user_id OR u.id = gp.user_id
      WHERE course_member.course_id = $1 AND activity_member.activity_id = $2
    `, [courseId, activityId])) as Participant[]
    if (!activityMembers.length) {
      return (await this.repository.query(`
      SELECT DISTINCT COALESCE(course_member.user_id, gp.user_id) as id,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email
        FROM "CourseMembers" course_member
        LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
        INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id
        WHERE course_member.course_id = $1
    `, [courseId])) as Participant[]
    }
    return activityMembers;
  }

  private calculateVirtualColumns(entity: ActivityEntity, raw?: any) {
    // TODO move close to answer module
    Object.assign(entity, {
      state: calculateActivityState(entity)
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
