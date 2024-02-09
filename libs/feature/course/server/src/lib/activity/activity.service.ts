/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { ForbiddenResponse, NotFoundResponse, User, isTeacherRole } from '@platon/core/common'
import { DatabaseService, EventService, IRequest, buildSelectQuery } from '@platon/core/server'
import {
  ActivityFilters,
  CreateActivity,
  ReloadActivity,
  UpdateActivity,
  calculateActivityOpenState,
  canUserAnswerActivity,
} from '@platon/feature/course/common'
import { ResourceEntity, ResourceFileService } from '@platon/feature/resource/server'
import { CLS_REQ } from 'nestjs-cls'
import { In, Repository, SelectQueryBuilder } from 'typeorm'
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

type ActivityGuard = (activity: ActivityEntity) => void | Promise<void>

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name)

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
    private readonly repository: Repository<ActivityEntity>,

    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>
  ) {}

  async search(courseId: string, filters?: ActivityFilters): Promise<[ActivityEntity[], number]> {
    const qb = this.createQueryBuilder(courseId)

    if (filters?.sectionId) {
      qb.andWhere(`section_id = :sectionId`, { sectionId: filters.sectionId })
    }

    if (filters?.challenge != null) {
      qb.andWhere(`is_challenge = :isChallenge`, { isChallenge: !!filters.challenge })
    }

    const [entities, count] = await qb.getManyAndCount()
    await this.addVirtualColumns(...entities)
    return [entities, count]
  }

  async findByIdForUser(id: string, user: User): Promise<ActivityEntity> {
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

  async create(activity: Partial<ActivityEntity>): Promise<ActivityEntity> {
    const result = await this.repository.save(activity)
    await this.addVirtualColumns(result)
    return result
  }

  async update(
    courseId: string,
    activityId: string,
    changes: Partial<ActivityEntity>,
    guard?: ActivityGuard
  ): Promise<ActivityEntity> {
    const activity = await this.repository.findOne({
      where: {
        courseId,
        id: activityId,
      },
    })

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }

    if (guard) {
      await guard(activity)
    }

    Object.assign(activity, {
      ...changes,

      // REMOVE ALL VIRTUAL COLUMNS HERE
      title: undefined,
      state: undefined,
      timeSpent: undefined,
      resourceId: undefined,
      exerciseCount: undefined,
      progression: undefined,
      permissions: undefined,
    } as Partial<ActivityEntity>)

    const result = await this.repository.save(activity)
    await this.addVirtualColumns(result)
    return result
  }

  async reload(
    courseId: string,
    activityId: string,
    input: ReloadActivity,
    guard?: ActivityGuard
  ): Promise<ActivityEntity> {
    let activity = await this.repository.findOne({
      where: {
        courseId,
        id: activityId,
      },
    })

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }

    if (guard) {
      await guard(activity)
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

  async delete(courseId: string, activityId: string, guard?: ActivityGuard) {
    const activity = await this.repository.findOne({
      where: {
        courseId,
        id: activityId,
      },
    })

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity not found: ${activityId}`)
    }

    if (guard) {
      await guard(activity)
    }

    return this.repository.remove(activity)
  }

  async withActivity(
    activityId: string,
    consumer: (activity?: ActivityEntity | null) => void | Promise<void>
  ): Promise<void> {
    const activity = await this.repository.findOne({
      where: {
        id: activityId,
      },
    })
    await consumer(activity)
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
    this.notificationService.notifyUserAboutCorrection(activity.id, userId).catch((error) => {
      this.logger.error('Failed to send notification', error)
    })
  }

  @OnEvent(ON_TERMINATE_ACTIVITY_EVENT)
  protected async onTerminateActivity(payload: OnTerminateActivityEventPayload): Promise<void> {
    const { activity } = payload
    this.notificationService
      .notifyCorrectorsAboutPending(await this.activityCorrectorService.findViews(activity.id))
      .catch((error) => {
        this.logger.error('Failed to send notification', error)
      })
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
    const resourceIdOfUntitleActivities = new Set(
      activities
        .filter((activity) => !(activity.source.variables.title as string)?.trim())
        .map((activity) => activity.source.resource as string)
    )

    const resources = resourceIdOfUntitleActivities.size
      ? await this.resourceRepository.find({
          where: {
            id: In(Array.from(resourceIdOfUntitleActivities)),
          },
        })
      : []

    activities.forEach((activity) => {
      const title = activity.source.variables.title as string
      const exerciseGroups = (activity.source.variables.exerciseGroups as Record<string, unknown[]>) || {}
      Object.assign(activity, {
        state: calculateActivityOpenState(activity),
        title: title?.trim() || resources.find((r) => r.id === activity.source.resource)?.name,
        resourceId: activity.source.resource,
        exerciseCount: Object.keys(exerciseGroups).reduce((acc, group) => acc + exerciseGroups[group].length, 0),
        permissions: {
          update: activity.creatorId === this.request.user.id,
          answer: canUserAnswerActivity(activity, this.request.user),
          viewStats: isTeacherRole(this.request.user.role),
          viewResource: isTeacherRole(this.request.user.role),
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
