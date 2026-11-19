import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  UserOrderings,
  USER_ORDERING_DIRECTIONS,
  isTeacherRole,
  NotFoundResponse,
  ForbiddenResponse,
  User,
  UserRoles,
} from '@platon/core/common'
import { CourseMemberFilters, RestrictionSubject } from '@platon/feature/course/common'
import { In, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CourseNotificationService } from '../course-notification/course-notification.service'
import { CourseMemberEntity } from './course-member.entity'
import { CourseMemberRoles } from '@platon/feature/course/common'
import { courseGroupsOf, membershipsOf } from './course-member.sql'
import { CourseMemberView } from './course-member.view'
import { UserGroupService, UserService } from '@platon/core/server'

@Injectable()
export class CourseMemberService {
  private readonly logger = new Logger(CourseMemberService.name)

  constructor(
    private readonly notificationService: CourseNotificationService,
    private readonly userGroupService: UserGroupService,
    private readonly userService: UserService,

    @InjectRepository(CourseMemberView)
    private readonly view: Repository<CourseMemberView>,
    @InjectRepository(CourseMemberEntity)
    private readonly repository: Repository<CourseMemberEntity>
  ) {}

  /** What the restrictions of a course's activities need to know of a person, in one query. */
  async restrictionSubject(courseId: string, userId: string): Promise<RestrictionSubject> {
    const [{ memberIds, groupIds }] = await this.repository.query(
      `
      WITH memberships AS (${membershipsOf('$2')}), held_groups AS (${courseGroupsOf('$2')})
      SELECT
        ARRAY(SELECT member_id::text FROM memberships WHERE course_id = $1) AS "memberIds",
        ARRAY(SELECT group_id::text FROM held_groups WHERE course_id = $1) AS "groupIds"
      `,
      [courseId, userId]
    )
    return { userId, memberIds: new Set(memberIds), groupIds: new Set(groupIds) }
  }

  async getByUserIdAndCourseId(userId: string, courseId: string): Promise<Optional<CourseMemberEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { userId, courseId } }))
  }

  async findById(courseId: string, id: string): Promise<Optional<CourseMemberEntity>> {
    const query = this.repository.createQueryBuilder('member')
    query.leftJoinAndSelect('member.user', 'user')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('member.course_id = :courseId', { courseId }).andWhere('member.id = :id', { id })

    const member = await query.getOne()
    if (member && !member.user?.id) {
      member.user = undefined
    }

    return Optional.ofNullable(member)
  }

  async findByIds(courseId: string, ids: string[]): Promise<CourseMemberEntity[]> {
    if (ids.length === 0) {
      return []
    }

    const query = this.repository.createQueryBuilder('member')
    query.leftJoinAndSelect('member.user', 'user')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('member.course_id = :courseId', { courseId }).andWhere('member.id IN (:...ids)', { ids })

    const members = await query.getMany()
    members.forEach((member) => {
      if (member && !member.user?.id) {
        member.user = undefined
      }
    })

    return members
  }

  async findViewsByCourseId(courseId: string): Promise<CourseMemberView[]> {
    return this.view.find({ where: { courseId } })
  }

  async findViewsByCourseIds(courseIds: string[]): Promise<CourseMemberView[]> {
    return this.view.find({ where: { courseId: In(courseIds) } })
  }

  async search(courseId: string, filters?: CourseMemberFilters): Promise<[CourseMemberEntity[], number]> {
    filters = filters || {}

    const query = this.repository.createQueryBuilder('member')
    query.leftJoinAndSelect('member.user', 'user')
    query.leftJoinAndSelect('member.group', 'group')
    query.leftJoinAndSelect('group.users', 'groupusers')

    query.where('course_id = :courseId', { courseId })

    if (filters.roles?.length) {
      if (filters.roles.includes(CourseMemberRoles.student)) {
        query.andWhere('(group.id IS NOT NULL OR member.role IN (:...roles))', { roles: filters.roles })
      } else {
        query.andWhere('member.role IN (:...roles)', { roles: filters.roles })
      }
    }

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(
        `(
        user.username ILIKE :search
        OR user.email ILIKE :search
        OR f_unaccent(user.first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(user.last_name) ILIKE f_unaccent(:search)
        OR f_unaccent(group.name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${search}%` }
      )
    }

    const fields: Record<UserOrderings, string> = {
      NAME: 'user.username',
      CREATED_AT: 'member.created_at',
      UPDATED_AT: 'member.updated_at',
    }

    const order = filters.order || UserOrderings.NAME
    const direction = filters.direction || USER_ORDERING_DIRECTIONS[order]
    if (order === UserOrderings.NAME) {
      query
        .orderBy('user.last_name', direction)
        .addOrderBy('user.first_name', direction)
        .addOrderBy('user.username', direction)
        .addOrderBy('group.name', direction)
    } else {
      query.orderBy(fields[order], direction)
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    const [members, count] = await query.getManyAndCount()
    members.forEach((member) => {
      member.user = member.user?.id ? member.user : undefined
    })

    return [members, count]
  }

  async addUser(courseId: string, userId: string, role: CourseMemberRoles, notify = true): Promise<CourseMemberEntity> {
    if (role === CourseMemberRoles.teacher) {
      const user = (await this.userService.findById(userId)).orElseThrow(() => new NotFoundResponse('User not found'))
      if (!isTeacherRole(user.role)) {
        throw new ForbiddenResponse('Only users with a teacher role can be assigned the role of teacher')
      }
    }
    const member = await this.repository.save(this.repository.create({ courseId, userId, role }))
    if (notify) {
      this.notificationService
        .notifyCourseMemberBeingCreated(
          await this.view.find({
            where: {
              courseId,
              memberId: member.id,
            },
          })
        )
        .catch((error) => {
          this.logger.error('Failed to send notification', error)
        })
    }
    return member
  }

  async addGroup(
    courseId: string,
    groupId: string,
    options?: { notify?: boolean; role?: CourseMemberRoles }
  ): Promise<CourseMemberEntity> {
    const { notify = true, role = CourseMemberRoles.student } = options ?? {}
    if (role === CourseMemberRoles.teacher) {
      const groupMembers = await this.userGroupService.listMembers(groupId)
      if (!groupMembers.every((member) => isTeacherRole(member.role))) {
        throw new ForbiddenResponse('Only groups composed of teachers can be assigned the role of teacher')
      }
    }

    const member = await this.repository.save(this.repository.create({ courseId, groupId, role }))
    if (notify) {
      this.notificationService
        .notifyCourseMemberBeingCreated(
          await this.view.find({
            where: {
              courseId,
              memberId: member.id,
            },
          })
        )
        .catch((error) => {
          this.logger.error('Failed to send notification', error)
        })
    }
    return member
  }

  async delete(courseId: string, memberId: string): Promise<void> {
    await this.repository.delete({ courseId, id: memberId })
  }

  async updateRole(courseId: string, memberId: string, role: CourseMemberRoles): Promise<void> {
    const memberView = await this.view.findOne({ where: { courseId, memberId } })
    if (!memberView) {
      throw new NotFoundResponse('Member not found')
    }
    if (role === CourseMemberRoles.teacher && !isTeacherRole(memberView.userRole)) {
      throw new ForbiddenResponse('Only teachers can be assigned the role of teacher')
    }
    await this.repository.update({ courseId, id: memberId }, { role })
  }

  async setArchivedByUser(courseId: string, userId: string, archived: boolean): Promise<void> {
    const member = (await this.getByUserIdAndCourseId(userId, courseId)).orElseThrow(
      () => new NotFoundResponse('You are not a direct member of this course')
    )
    await this.repository.update({ id: member.id, courseId }, { archived })
  }

  async isMember(courseId: string, userId: string): Promise<boolean> {
    const result = await this.view.findOne({
      where: { courseId, id: userId },
    })
    return result != null
  }

  async hasWritePermission(courseId: string, user: User): Promise<boolean> {
    if (user.role === UserRoles.admin) {
      return true
    }
    const result = await this.view.findOne({
      where: { courseId, id: user.id, role: CourseMemberRoles.teacher },
    })
    return result != null
  }

  async getCoursesByMemberId(memberId: string): Promise<string[]> {
    const members = await this.view.find({ where: { memberId } })
    if (members.length === 0) {
      return []
    }
    return members.map((member) => member.courseId)
  }
}
