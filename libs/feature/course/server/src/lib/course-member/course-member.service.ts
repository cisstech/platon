import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrderingDirections,
  UserOrderings,
  UserRoles,
} from '@platon/core/common';
import { CourseMemberFilters } from '@platon/feature/course/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseNotificationService } from '../course-notification/course-notification.service';
import { CourseMemberEntity } from './course-member.entity';
import { CourseMemberView } from './course-member.view';

@Injectable()
export class CourseMemberService {
  constructor(
    @InjectRepository(CourseMemberView)
    private readonly view: Repository<CourseMemberView>,
    @InjectRepository(CourseMemberEntity)
    private readonly repository: Repository<CourseMemberEntity>,
    private readonly notificationService: CourseNotificationService
  ) {}

  async findById(
    courseId: string,
    id: string
  ): Promise<Optional<CourseMemberEntity>> {
    const query = this.repository.createQueryBuilder('member');
    query.leftJoinAndSelect('member.user', 'user');
    query.leftJoinAndSelect('member.group', 'group');
    query.leftJoinAndSelect('group.users', 'groupusers');

    query
      .where('member.course_id = :courseId', { courseId })
      .andWhere('member.id = :id', { id });

    return Optional.ofNullable(await query.getOne());
  }

  async search(
    courseId: string,
    filters?: CourseMemberFilters
  ): Promise<[CourseMemberEntity[], number]> {
    filters = filters || {};

    const query = this.repository.createQueryBuilder('member');
    query.leftJoinAndSelect('member.user', 'user');
    query.leftJoinAndSelect('member.group', 'group');
    query.leftJoinAndSelect('group.users', 'groupusers');

    query.where('course_id = :courseId', { courseId });

    if (filters.roles?.length) {
      if (filters.roles.includes(UserRoles.student)) {
        query.andWhere('group.id IS NOT NULL OR user.role IN (:...roles)', {
          roles: filters.roles,
        });
      } else {
        query.andWhere('user.role IN (:...roles)', { roles: filters.roles });
      }
    }

    if (filters.search) {
      query.andWhere(
        `(
        user.username ILIKE :search
        OR user.email ILIKE :search
        OR f_unaccent(user.first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(user.last_name) ILIKE f_unaccent(:search)
        OR f_unaccent(group.name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${filters.search}%` }
      );
    }

    if (filters.order) {
      const fields: Record<UserOrderings, string> = {
        NAME: 'user.username',
        CREATED_AT: 'member.created_at',
        UPDATED_AT: 'member.updated_at',
      };

      const orderings: Record<UserOrderings, keyof typeof OrderingDirections> =
        {
          NAME: 'ASC',
          CREATED_AT: 'DESC',
          UPDATED_AT: 'DESC',
        };

      query.orderBy(
        fields[filters.order],
        filters.direction || orderings[filters.order]
      );
    } else {
      query.orderBy('user.username', 'ASC').addOrderBy('group.name', 'ASC');
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
    const member = await this.repository.save(
      this.repository.create({ courseId, userId })
    );
    await this.notificationService.sendMemberCreation(member);
    return member;
  }

  async addGroup(
    courseId: string,
    groupId: string
  ): Promise<CourseMemberEntity> {
    const member = await this.repository.save(
      this.repository.create({ courseId, groupId })
    );
    await this.notificationService.sendMemberCreation(member);
    return member;
  }

  async delete(courseId: string, memberId: string): Promise<void> {
    await this.repository.delete({ courseId, id: memberId });
  }

  async isMember(courseId: string, userId: string): Promise<boolean> {
    const result = await this.view.findOne({
      where: { courseId, id: userId },
    });
    return result != null;
  }
}
