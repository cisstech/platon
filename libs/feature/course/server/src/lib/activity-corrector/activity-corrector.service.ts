import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ActivityCorrectorEntity } from './activity-corrector.entity'
import { ActivityCorrectorView } from './activity-corrector.view'
import { CourseNotificationService } from '../course-notification/course-notification.service'

@Injectable()
export class ActivityCorrectorService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: CourseNotificationService,

    @InjectRepository(ActivityCorrectorView)
    private readonly view: Repository<ActivityCorrectorView>,
    @InjectRepository(ActivityCorrectorEntity)
    private readonly repository: Repository<ActivityCorrectorEntity>
  ) {}

  async findById(activityId: string, correctorId: string): Promise<Optional<ActivityCorrectorEntity>> {
    const query = this.repository.createQueryBuilder('corrector')
    query.leftJoinAndSelect('corrector.user', 'user')
    query.leftJoinAndSelect('corrector.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query
      .where('corrector.activity_id = :activityId', { activityId })
      .andWhere('corrector.id = :id', { id: correctorId })

    const corrector = await query.getOne()
    if (corrector && !corrector.user?.id) {
      corrector.user = undefined
    }

    return Optional.ofNullable(corrector)
  }

  async findUsers(activityId: string, correctorIds: string[]): Promise<ActivityCorrectorView[]> {
    return this.view.find({
      where: {
        activityId,
        correctorId: In(correctorIds),
      },
    })
  }

  async search(activityId: string): Promise<[ActivityCorrectorEntity[], number]> {
    const query = this.repository.createQueryBuilder('corrector')
    query.leftJoinAndSelect('corrector.user', 'user')
    query.leftJoinAndSelect('corrector.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('activity_id = :activityId', { activityId })

    const [correctors, count] = await query.getManyAndCount()
    correctors.forEach((corrector) => {
      corrector.user = corrector.user?.id ? corrector.user : undefined
    })

    return [correctors, count]
  }

  async create(corrector: Partial<ActivityCorrectorEntity>): Promise<ActivityCorrectorEntity> {
    const result = await this.repository.save(this.repository.create(corrector))
    this.notificationService
      .notifyCorrectorsBeingCreated(
        await this.view.find({
          where: {
            correctorId: result.id,
            activityId: corrector.activityId,
          },
        })
      )
      .catch()
    return result
  }

  async update(activityId: string, input: Partial<ActivityCorrectorEntity>[]): Promise<ActivityCorrectorEntity[]> {
    const oldCorrectors = await this.view.find({
      where: {
        activityId,
      },
    })

    const updates = await this.dataSource.transaction(async (manager) => {
      await manager.delete(ActivityCorrectorEntity, { activityId })
      const correctors = input.map((member) => {
        return manager.create(ActivityCorrectorEntity, {
          ...member,
          activityId,
        } as ActivityCorrectorEntity)
      })
      return manager.save(correctors)
    })

    const newCorrectors = await this.view.find({
      where: {
        activityId,
      },
    })

    const newCreatedCorrectors = newCorrectors.filter(
      (corrector) => !oldCorrectors.some((oldCorrector) => oldCorrector.id === corrector.id)
    )

    if (newCreatedCorrectors.length) {
      this.notificationService.notifyCorrectorsBeingCreated(newCreatedCorrectors).catch()
    }

    const newRemovedCorrectors = oldCorrectors.filter(
      (oldCorrector) => !newCorrectors.some((newCorrector) => newCorrector.id === oldCorrector.id)
    )

    if (newRemovedCorrectors.length) {
      this.notificationService.notifyCorrectorsBeingRemoved(newRemovedCorrectors).catch()
    }

    return updates
  }

  async delete(activityId: string, activityCorrectorId: string): Promise<void> {
    const correctors = await this.view.find({
      where: {
        activityId,
        correctorId: activityCorrectorId,
      },
    })

    const result = await this.repository.delete({ activityId, id: activityCorrectorId })

    if (result.affected) {
      this.notificationService.notifyCorrectorsBeingRemoved(correctors).catch()
    }
  }

  async isCorrector(activityId: string, userId: string): Promise<boolean> {
    const result = await this.view.findOne({
      where: { activityId, id: userId },
    })
    return result != null
  }
}
