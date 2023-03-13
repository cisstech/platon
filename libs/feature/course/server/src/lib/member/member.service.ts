import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderingDirections, UserOrderings, UserRoles } from '@platon/core/common';
import { CourseMemberFilters } from '@platon/feature/course/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseMemberEntity } from './member.entity';

export interface ActivityUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}
@Injectable()
export class CourseMemberService {
  constructor(
    @InjectRepository(CourseMemberEntity)
    private readonly repository: Repository<CourseMemberEntity>
  ) { }


  async findById(
    courseId: string,
    id: string
  ): Promise<Optional<CourseMemberEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({
        where: { courseId, id },
        relations: {
          user: true,
          group: true
        }
      })
    );
  }

  async findByUserId(
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

  async findUsersOfActivity(
    courseId: string,
    activityId: string,
  ): Promise<ActivityUser[]> {
    const activityMembers = (await this.repository.query(`
      SELECT DISTINCT COALESCE(cm.user_id, gp.user_id) as id,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email
      FROM "CourseActivityMembers" cam
      INNER JOIN "CourseMembers" cm ON cm.id = cam.member_id
      LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = cm.group_id
      INNER JOIN "Users" u ON u.id = cm.user_id OR u.id = gp.user_id
      WHERE cm.course_id = $1 AND cam.activity_id = $2
    `, [courseId, activityId])) as ActivityUser[]
    if (!activityMembers.length) {
      return (await this.repository.query(`
      SELECT DISTINCT COALESCE(cm.user_id, gp.user_id) as id,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email
        FROM "CourseMembers" cm
        LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = cm.group_id
        INNER JOIN "Users" u ON u.id = cm.user_id OR u.id = gp.user_id
        WHERE cm.course_id = $1
    `, [courseId])) as ActivityUser[]
    }
    return activityMembers;
  }

  async search(courseId: string, filters?: CourseMemberFilters): Promise<[CourseMemberEntity[], number]> {
    filters = filters || {};

    const query = this.repository.createQueryBuilder('member');
    query.leftJoinAndSelect('member.user', 'user', 'user.id = member.user_id');
    query.leftJoinAndSelect('member.group', 'group', 'group.id = member.group_id');


    if (filters.activities) {
      query.innerJoin(
        'CourseActivityMembers',
        'activitymember',
        'activitymember.member_id = member.id AND activitymember.activity_id IN (:...ids)',
        { ids: filters.activities }
      );
    }

    query.where('course_id = :courseId', { courseId });

    if (filters.roles?.length) {
      if (filters.roles.includes(UserRoles.student)) {
        query.andWhere('group.id IS NOT NULL OR user.role IN (:...roles)', { roles: filters.roles })
      } else {
        query.andWhere('user.role IN (:...roles)', { roles: filters.roles })
      }
    }

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
      query.orderBy('user.username', 'ASC')
        .addOrderBy('group.name', 'ASC');
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

  async addGroup(courseId: string, groupId: string): Promise<CourseMemberEntity> {
    return this.repository.save(
      this.repository.create({ courseId, groupId })
    );
  }

  async delete(courseId: string, memberId: string) {
    return this.repository.delete({ courseId, id: memberId });
  }
}
