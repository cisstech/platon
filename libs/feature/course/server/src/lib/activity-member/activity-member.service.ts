import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { ActivityMemberEntity } from './activity-member.entity';

@Injectable()
export class ActivityMemberService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ActivityMemberEntity)
    private readonly repository: Repository<ActivityMemberEntity>
  ) { }

  async findById(
    activityId: string,
    id: string
  ): Promise<Optional<ActivityMemberEntity>> {
    const query = this.repository.createQueryBuilder('amember');
    query.leftJoinAndSelect('amember.user', 'user');
    query.leftJoinAndSelect('amember.member', 'member');
    query.leftJoinAndSelect('member.group', 'group');
    query.leftJoinAndSelect('group.users', 'groupusers');

    query.where('amember.activity_id = :activityId', { activityId })
      .andWhere('amember.id = :id', { id })

    return Optional.ofNullable(
      await query.getOne()
    );
  }

  async search(activityId: string): Promise<[ActivityMemberEntity[], number]> {
    const query = this.repository.createQueryBuilder('amember');
    query.leftJoinAndSelect('amember.user', 'user');
    query.leftJoinAndSelect('amember.member', 'member');
    query.leftJoinAndSelect('member.group', 'group');
    query.leftJoinAndSelect('group.users', 'groupusers');

    query.where('activity_id = :activityId', { activityId });

    return query.getManyAndCount();
  }

  async create(member: Partial<ActivityMemberEntity>): Promise<ActivityMemberEntity> {
    return this.repository.save(
      this.repository.create(member)
    );
  }

  async update(activityId: string, input: Partial<ActivityMemberEntity>[]): Promise<ActivityMemberEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(ActivityMemberEntity, { activityId })
      const members = input.map(member => {
        return manager.create(ActivityMemberEntity, {
          ...member,
          activityId
        } as ActivityMemberEntity)
      })
      return manager.save(members)
    })
  }

  async delete(activityId: string, activityMemberId: string): Promise<void> {
    await this.repository.delete({ activityId, id: activityMemberId });
  }
}
