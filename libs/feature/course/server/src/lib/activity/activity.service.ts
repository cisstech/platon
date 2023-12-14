/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { ForbiddenResponse, NotFoundResponse, User, UserRoles } from '@platon/core/common'
import { DatabaseService, EventService, IRequest, buildSelectQuery } from '@platon/core/server'
import {
  ActivityFilters,
  CreateActivity,
  ReloadActivity,
  UpdateActivity,
  calculateActivityOpenState,
} from '@platon/feature/course/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { CLS_REQ } from 'nestjs-cls'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ActivityCorrectorService } from '../activity-corrector/activity-corrector.service'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { ActivityMemberView } from '../activity-member/activity-member.view'
import { CourseNotificationService } from '../course-notification/course-notification.service'
import { ActivityEntity } from './activity.entity'
import {
  ON_CORRECT_ACTIVITY_EVENT,
  ON_RELOAD_ACTIVITY_EVENT,
  ON_TERMINATE_ACTIVITY_EVENT,
  OnCorrectActivityEventPayload,
  OnReloadActivityEventPayload,
  OnTerminateActivityEventPayload,
} from './activity.event'

@Injectable()
export class ActivityService {
  constructor(
    @Inject(CLS_REQ)
    private readonly request: IRequest,
    private readonly fileService: ResourceFileService,
    private readonly eventService: EventService,
    private readonly databaseService: DatabaseService,
    private readonly notificationService: CourseNotificationService,
    private readonly activityMemberService: ActivityMemberService,
    private readonly activityCorrectorService: ActivityCorrectorService,
    @InjectRepository(ActivityEntity)
    private readonly repository: Repository<ActivityEntity>
  ) {}

  async search(courseId: string, filters?: ActivityFilters): Promise<[ActivityEntity[], number]> {
    const qb = this.createQueryBuilder(courseId)

    if (filters?.sectionId) {
      qb.andWhere(`section_id = :sectionId`, { sectionId: filters.sectionId })
    }

    const [entities, count] = await qb.getManyAndCount()
    await this.addVirtualColumns(...entities)
    return [entities, count]
  }

  async findById(id: string, user: User): Promise<ActivityEntity> {
    const qb = buildSelectQuery(this.repository.createQueryBuilder('activity'), (qb) =>
      qb.where('activity.id = :id', { id })
    )

    const activity = await qb.getOne()
    if (!activity) {
      throw new NotFoundResponse(`Activity ${id} not found.`)
    }

    const isCreator = user.id === activity.creatorId
    if (!isCreator && !(await this.activityMemberService.isMember(id, user.id))) {
      throw new ForbiddenResponse(`You are not a member of this activity`)
    }

    await this.addVirtualColumns(activity)

    return activity
  }

  async findByCourseId(courseId: string, activityId: string): Promise<Optional<ActivityEntity>> {
    const qb = this.createQueryBuilder(courseId)
    qb.andWhere(`activity.id = :id`, { id: activityId })

    const activity = await qb.getOne()
    if (activity) {
      await this.addVirtualColumns(activity)
    }

    return Optional.ofNullable(activity)
  }

  async findAllOfUser(userId: string): Promise<ActivityEntity[]> {
    const qb = buildSelectQuery(this.repository.createQueryBuilder('activity'), (qb) =>
      qb.where('activity.creator_id = :userId', { userId })
    )

    const activities = await qb.getMany()
    await this.addVirtualColumns(...activities)
    return activities
  }

  async create(activity: Partial<ActivityEntity>): Promise<ActivityEntity> {
    const result = await this.repository.save(activity)
    await this.addVirtualColumns(result)
    return result
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

    Object.assign(activity, {
      ...changes,

      // REMOVE ALL VIRTUAL COLUMNS HERE
      title: undefined,
      state: undefined,
      duration: undefined,
      progression: undefined,
      permissions: undefined,
    })

    const result = await this.repository.save(activity)
    await this.addVirtualColumns(result)
    return result
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

    const { source } = await this.fileService.compile({
      resourceId: activity.source.resource,
      version: input.version,
    })
    activity.source = source

    activity = await this.repository.save(activity)

    this.eventService.emit<OnReloadActivityEventPayload>(ON_RELOAD_ACTIVITY_EVENT, { activity })

    await this.addVirtualColumns(activity)

    return activity
  }

  async delete(courseId: string, activityId: string) {
    return this.repository.delete({ courseId, id: activityId })
  }

  async fromInput(input: CreateActivity | UpdateActivity): Promise<ActivityEntity> {
    const activity = new ActivityEntity()

    if ('resourceId' in input) {
      const { source } = await this.fileService.compile({
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

  @OnEvent(ON_CORRECT_ACTIVITY_EVENT)
  protected onCorrectActivity(payload: OnCorrectActivityEventPayload) {
    const { userId, activity } = payload
    this.notificationService.notifyUserAboutCorrection(activity.id, userId).catch()
  }

  @OnEvent(ON_TERMINATE_ACTIVITY_EVENT)
  protected async onTerminateActivity(payload: OnTerminateActivityEventPayload): Promise<void> {
    const { activity } = payload
    this.notificationService
      .notifyCorrectorsAboutPending(await this.activityCorrectorService.findViews(activity.id))
      .catch()
  }

  private createQueryBuilder(courseId: string) {
    // TODO select only the fields we need here
    const qb = buildSelectQuery(
      this.repository.createQueryBuilder('activity'),
      (qb) => this.withMemberJoin(qb, this.request.user),
      (qb) => qb.where(`activity.course_id = :courseId`, { courseId }),
      (qb) => this.withMemberClause(qb, this.request.user)
    )
    return qb
  }

  private async addVirtualColumns(...activities: ActivityEntity[]): Promise<void> {
    activities.forEach((activity) => {
      Object.assign(activity, {
        state: calculateActivityOpenState(activity),
        permissions: {
          update: activity.creatorId === this.request.user.id,
          viewStats: [UserRoles.admin, UserRoles.teacher].includes(this.request.user.role),
        },
      } as Partial<ActivityEntity>)
    })
    await this.databaseService.resolveVirtualColumns(ActivityEntity, activities, this.request.user)
  }

  private withMemberJoin(qb: SelectQueryBuilder<ActivityEntity>, user: User | string) {
    const userId = typeof user === 'string' ? user : user.id
    return qb.leftJoin(ActivityMemberView, 'member', 'member.activity_id = activity.id AND member.id = :userId', {
      userId,
    })
  }

  private withMemberClause(qb: SelectQueryBuilder<ActivityEntity>, user: User | string) {
    const userId = typeof user === 'string' ? user : user.id
    return qb.andWhere(`(activity.creator_id = :userId OR member.id IS NOT NULL)`, {
      userId,
    })
  }
}
