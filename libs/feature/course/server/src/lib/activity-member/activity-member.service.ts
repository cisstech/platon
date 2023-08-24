import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, IsNull, Not, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CourseNotificationService } from '../course-notification/course-notification.service'
import { ActivityMemberEntity } from './activity-member.entity'
import { ActivityMemberView } from './activity-member.view'

@Injectable()
export class ActivityMemberService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: CourseNotificationService,

    @InjectRepository(ActivityMemberView)
    private readonly view: Repository<ActivityMemberView>,
    @InjectRepository(ActivityMemberEntity)
    private readonly repository: Repository<ActivityMemberEntity>
  ) {}

  async findById(activityId: string, id: string): Promise<Optional<ActivityMemberEntity>> {
    const query = this.repository.createQueryBuilder('amember')
    query.leftJoinAndSelect('amember.user', 'user')
    query.leftJoinAndSelect('amember.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('amember.activity_id = :activityId', { activityId }).andWhere('amember.id = :id', { id })

    const member = await query.getOne()
    if (member && !member.user?.id) {
      member.user = undefined
    }

    return Optional.ofNullable(member)
  }

  async search(activityId: string): Promise<[ActivityMemberEntity[], number]> {
    const query = this.repository.createQueryBuilder('amember')
    query.leftJoinAndSelect('amember.user', 'user')
    query.leftJoinAndSelect('amember.member', 'member')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('activity_id = :activityId', { activityId })

    const [members, count] = await query.getManyAndCount()
    members.forEach((member) => {
      member.user = member.user?.id ? member.user : undefined
    })

    return [members, count]
  }

  async create(member: Partial<ActivityMemberEntity>): Promise<ActivityMemberEntity> {
    const result = await this.repository.save(this.repository.create(member))
    this.notificationService
      .notifyActivityMemberBeingCreated(
        await this.view.find({
          where: {
            memberId: result.id,
            activityId: member.activityId,
          },
        })
      )
      .catch()
    return result
  }

  async update(activityId: string, input: Partial<ActivityMemberEntity>[]): Promise<ActivityMemberEntity[]> {
    const oldViews = await this.view.find({ where: { activityId, memberId: Not(IsNull()) } })

    const members = await this.dataSource.transaction(async (manager) => {
      await manager.delete(ActivityMemberEntity, { activityId })
      const members = input.map((member) => {
        return manager.create(ActivityMemberEntity, {
          ...member,
          activityId,
        } as ActivityMemberEntity)
      })
      return manager.save(members)
    })

    const newViews = await this.view.find({ where: { activityId, memberId: Not(IsNull()) } })

    const insertion = newViews.filter((member) => !oldViews.some((old) => old.id === member.id))
    if (insertion.length) {
      this.notificationService.notifyActivityMemberBeingCreated(insertion).catch()
    }

    return members
  }

  async delete(activityId: string, activityMemberId: string): Promise<void> {
    await this.repository.delete({ activityId, id: activityMemberId })
  }

  async isMember(activityId: string, userId: string): Promise<boolean> {
    const result = await this.view.findOne({
      where: { activityId, id: userId },
    })
    return result != null
  }
}
