import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ActivityCorrectorEntity } from './activity-corrector.entity'
import { ActivityCorrectorView } from './activity-corrector.view'

@Injectable()
export class ActivityCorrectorService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ActivityCorrectorView)
    private readonly view: Repository<ActivityCorrectorView>,
    @InjectRepository(ActivityCorrectorEntity)
    private readonly repository: Repository<ActivityCorrectorEntity>
  ) {}

  async findById(activityId: string, id: string): Promise<Optional<ActivityCorrectorEntity>> {
    const query = this.repository.createQueryBuilder('acorrector')
    query.leftJoinAndSelect('acorrector.user', 'user')
    query.leftJoinAndSelect('acorrector.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query
      .where('acorrector.activity_id = :activityId', { activityId })
      .andWhere('acorrector.id = :id', { id })

    return Optional.ofNullable(await query.getOne())
  }

  async search(activityId: string): Promise<[ActivityCorrectorEntity[], number]> {
    const query = this.repository.createQueryBuilder('acorrector')
    query.leftJoinAndSelect('acorrector.user', 'user')
    query.leftJoinAndSelect('acorrector.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('activity_id = :activityId', { activityId })

    return query.getManyAndCount()
  }

  async create(corrector: Partial<ActivityCorrectorEntity>): Promise<ActivityCorrectorEntity> {
    return this.repository.save(this.repository.create(corrector))
  }

  async update(
    activityId: string,
    input: Partial<ActivityCorrectorEntity>[]
  ): Promise<ActivityCorrectorEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ActivityCorrectorEntity, { activityId })
      const correctors = input.map((member) => {
        return manager.create(ActivityCorrectorEntity, {
          ...member,
          activityId,
        } as ActivityCorrectorEntity)
      })
      return manager.save(correctors)
    })
  }

  async delete(activityId: string, activityCorrectorId: string): Promise<void> {
    await this.repository.delete({ activityId, id: activityCorrectorId })
  }

  async isCorrector(activityId: string, userId: string): Promise<boolean> {
    const result = await this.view.findOne({
      where: { activityId, id: userId },
    })
    return result != null
  }
}
