/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ForbiddenResponse, NotFoundResponse, User, UserRoles } from '@platon/core/common'
import { EventService, IRequest, buildQuery } from '@platon/core/server'
import {
  ActivityFilters,
  CreateActivity,
  ReloadActivity,
  UpdateActivity,
  calculateActivityState,
} from '@platon/feature/course/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { CLS_REQ } from 'nestjs-cls'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Optional } from 'typescript-optional'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { ActivityMemberView } from '../activity-member/activity-member.view'
import { ActivityEntity } from './activity.entity'
import { ON_RELOAD_ACTIVITY_EVENT } from './activity.event'

@Injectable()
export class ActivityService {
  constructor(
    @Inject(CLS_REQ)
    private readonly request: IRequest,
    private readonly fileService: ResourceFileService,
    private readonly eventService: EventService,
    private readonly activityMemberService: ActivityMemberService,

    @InjectRepository(ActivityEntity)
    private readonly repository: Repository<ActivityEntity>
  ) {}

  async search(courseId: string, filters?: ActivityFilters): Promise<[ActivityEntity[], number]> {
    const qb = this.createQueryBuilder(courseId)

    if (filters?.sectionId) {
      qb.andWhere(`section_id = :sectionId`, { sectionId: filters.sectionId })
    }

    const { entities, raw: raws } = await qb.getRawAndEntities()
    entities.forEach((entity) => {
      this.addVirtualColumns(
        entity,
        raws.find((r) => r.activity_id === entity.id)
      )
    })

    return [entities, entities.length]
  }

  async findById(id: string, user: User): Promise<ActivityEntity> {
    const qb = buildQuery(this.repository.createQueryBuilder('activity'), (qb) => qb.where('activity.id = :id', { id }))
    const activity = await qb.getOne()
    if (!activity) {
      throw new NotFoundResponse(`Activity ${id} not found.`)
    }

    const isCreator = user.id === activity.creatorId
    if (!isCreator && !(await this.activityMemberService.isMember(id, user.id))) {
      throw new ForbiddenResponse(`You are not a member of this activity`)
    }

    return activity
  }

  async findByCourseIdAndId(courseId: string, id: string): Promise<Optional<ActivityEntity>> {
    const qb = this.createQueryBuilder(courseId)
    qb.andWhere(`activity.id = :id`, { id })

    const { entities, raw: raws } = await qb.getRawAndEntities()
    entities.forEach((entity) => {
      this.addVirtualColumns(
        entity,
        raws.find((r) => r.activity_id === entity.id)
      )
    })

    return Optional.ofNullable(entities.pop())
  }

  async create(activity: Partial<ActivityEntity>): Promise<ActivityEntity> {
    return this.addVirtualColumns(await this.repository.save(activity))
  }

  async update(courseId: string, activityId: string, changes: Partial<ActivityEntity>): Promise<ActivityEntity> {
    const activity = await this.repository.findOne({
      where: {
        courseId,
        id: activityId,
      },
    })
    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }

    await this.repository.update({ id: activityId }, changes as QueryDeepPartialEntity<ActivityEntity>)

    Object.assign(activity, changes)
    return this.addVirtualColumns(activity)
  }

  async reload(courseId: string, activityId: string, input: ReloadActivity): Promise<ActivityEntity> {
    let activity = await this.repository.findOne({
      where: {
        courseId,
        id: activityId,
      },
    })

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }

    const [source] = await this.fileService.compile({
      resourceId: activity.source.resource,
      version: input.version,
    })
    activity.source = source

    activity = await this.repository.save(activity)

    this.eventService.emit(ON_RELOAD_ACTIVITY_EVENT, activity)

    return this.addVirtualColumns(activity)
  }

  async delete(courseId: string, activityId: string) {
    return this.repository.delete({ courseId, id: activityId })
  }

  async fromInput(input: CreateActivity | UpdateActivity): Promise<ActivityEntity> {
    const activity = new ActivityEntity()

    if ('resourceId' in input) {
      const [source] = await this.fileService.compile({
        resourceId: input.resourceId,
        version: input.resourceVersion,
      })
      activity.source = source
      delete (input as any).resourceId
      delete (input as any).resourceVersion
    }

    Object.assign(activity, input)

    return activity
  }

  private createQueryBuilder(courseId: string) {
    const qb = buildQuery(
      this.repository.createQueryBuilder('activity'),
      (qb) => this.withSessionJoin(qb, this.request.user),
      (qb) => this.withMemberJoin(qb, this.request.user),
      (qb) => qb.where(`activity.course_id = :courseId`, { courseId }),
      (qb) => this.withMemberClause(qb, this.request.user)
    )
    return qb
  }

  private addVirtualColumns(entity: ActivityEntity, rawResult?: any): ActivityEntity {
    Object.assign(entity, {
      state: calculateActivityState(entity),
      permissions: {
        update: entity.creatorId === this.request.user.id,
        viewStats: [UserRoles.admin, UserRoles.teacher].includes(this.request.user.role),
      },
    } as Partial<ActivityEntity>)
    if (rawResult) {
      const navigation = rawResult.session_variables?.navigation
      if (navigation?.exercises) {
        const started = navigation.exercises.filter((e: any) => e.state !== 'NOT_STARTED').length
        const graded = navigation.exercises.filter((e: any) => !['NOT_STARTED', 'STARTED'].includes(e.state)).length
        Object.assign(entity, {
          progression: (100 * graded + 10 * (started - graded)) / navigation.exercises.length,
        } as Partial<ActivityEntity>)
      }
    }
    return entity
  }

  private withMemberJoin(qb: SelectQueryBuilder<ActivityEntity>, user: User) {
    return qb.leftJoin(ActivityMemberView, 'member', 'member.activity_id = activity.id AND member.id = :userId', {
      userId: user.id,
    })
  }

  private withSessionJoin(qb: SelectQueryBuilder<ActivityEntity>, user: User) {
    return qb.leftJoinAndSelect(
      'Sessions',
      'session',
      'session.parent_id IS NULL AND session.activity_id = activity.id AND session.user_id = :userId',
      {
        userId: user.id,
      }
    )
  }

  private withMemberClause(qb: SelectQueryBuilder<ActivityEntity>, user: User) {
    return qb.andWhere(`(activity.creator_id = :userId OR member.id IS NOT NULL)`, {
      userId: user.id,
    })
  }
}
