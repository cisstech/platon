import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, OrderingDirections, UserOrderings } from '@platon/core/common';
import { UserEntity, UserGroupEntity } from '@platon/core/server';
import { CourseMemberFilters } from '@platon/feature/course/common';
import { DataSource, Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseMemberEntity } from './member.entity';

@Injectable()
export class CourseMemberService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CourseMemberEntity)
    private readonly repository: Repository<CourseMemberEntity>
  ) { }

  async byCourseAndUserId(
    courseId: string,
    userId: string
  ): Promise<Optional<CourseMemberEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({
        where: { courseId, userId },
        relations: {
          user: true,
          group: true
        }
      })
    );
  }

  async search(courseId: string, filters?: CourseMemberFilters): Promise<[CourseMemberEntity[], number]> {
    filters = filters || {};

    const query = this.repository.createQueryBuilder('member');
    query.leftJoinAndSelect('member.user', 'user', 'user.id = member.user_id');
    query.leftJoinAndSelect('member.group', 'group', 'group.id = member.group_id');

    query.where('course_id = :courseId', { courseId });

    if (filters.search) {
      query.andWhere(`(
        user.username ILIKE :search
        OR user.email ILIKE :search
        OR f_unaccent(user.first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(user.last_name) ILIKE f_unaccent(:search)
        OR f_unaccent(group.name) ILIKE f_unaccent(:search)
      )`, { search: `%${filters.search}%` });
    }

    if (filters.order) {
      const fields: Record<UserOrderings, string> = {
        'NAME': 'user.username',
        'CREATED_AT': 'member.created_at',
        'UPDATED_AT': 'member.updated_at',
      }

      const orderings: Record<UserOrderings, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order]);
    } else {
      query.orderBy('user.username', 'ASC');
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    if (filters.limit) {
      query.limit(filters.limit);
    }

    return query.getManyAndCount();
  }

  async addUser(courseId: string, userId: string): Promise<CourseMemberEntity> {
    return this.repository.save(
      this.repository.create({ courseId, userId })
    );
  }

  async addGroup(courseId: string, groupId: string): Promise<CourseMemberEntity[]> {
    return this.dataSource.transaction(async manager => {
      const group = await manager.findOne(UserGroupEntity, {
        where: { id: groupId }, relations: { users: true }
      });
      if (!group) {
        throw new NotFoundResponse(`UserGroup not found: ${groupId}`);
      }

      const members = group.users.map(user => manager.create(CourseMemberEntity, {
        courseId,
        groupId,
        userId: user.id
      }));

      await manager.upsert(CourseMemberEntity, members, {
        conflictPaths: {
          userId: true,
          groupId: true
        }
      });

      return manager.find(CourseMemberEntity, {
        where: { courseId, groupId }
      }).then(members => {
        return members.map(member => ({
          ...member,
          group,
          user: group.users.find(user => user.id === member.userId) as UserEntity
        }))
      });
    });
  }

  async delete(courseId: string, userId: string) {
    return this.repository.delete({ courseId, userId });
  }
}
