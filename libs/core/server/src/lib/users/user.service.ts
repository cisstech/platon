import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, UserFilters, UserOrderings, USER_ORDERING_DIRECTIONS, UserRoles } from '@platon/core/common'
import { isUUID4 } from '@platon/shared/server'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { UserEntity } from './user.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findById(id: string): Promise<Optional<UserEntity>> {
    const result = await this.repository.findOne({ where: { id } })
    return Optional.ofNullable(result)
  }

  async findByUsername(username: string): Promise<Optional<UserEntity>> {
    const result = await this.repository.findOne({ where: { username } })
    return Optional.ofNullable(result)
  }

  async findByIdOrName(userIdOrName: string): Promise<Optional<UserEntity>> {
    const result = isUUID4(userIdOrName)
      ? await this.repository.findOne({ where: { id: userIdOrName } })
      : await this.repository.findOne({ where: { username: userIdOrName } })
    return Optional.ofNullable(result)
  }

  async search(filters: UserFilters = {}): Promise<[UserEntity[], number]> {
    const query = this.repository.createQueryBuilder('user')

    if (filters.groups?.length) {
      query.innerJoin('UserGroupsUsers', 'group', 'group.user_id = user.id AND group.group_id IN (:...ids)', {
        ids: filters.groups,
      })
    }

    if (filters.lmses?.length) {
      query.innerJoin('LmsUsers', 'lms_user', 'lms_user.user_id = user.id AND lms_user.lms_id IN (:...ids)', {
        ids: filters.lmses,
      })
    }

    if (filters.roles?.length) {
      query.andWhere('role IN (:...roles)', { roles: filters.roles })
    }

    if (filters.active != null) {
      query.andWhere('active = :active', { active: !!filters.active })
    }

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(
        `(
        username ILIKE :search
        OR email ILIKE :search
        OR f_unaccent(first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(last_name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${search}%` }
      )
    }

    const fields: Record<UserOrderings, string> = {
      NAME: 'user.username',
      CREATED_AT: 'user.created_at',
      UPDATED_AT: 'user.updated_at',
    }

    const order = filters.order || UserOrderings.NAME
    const direction = filters.direction || USER_ORDERING_DIRECTIONS[order]
    if (filters.order === UserOrderings.NAME) {
      query
        .orderBy('user.last_name', direction)
        .addOrderBy('user.first_name', direction)
        .addOrderBy('user.username', direction)
    } else {
      query.orderBy(fields[order], direction)
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repository.save(user)
  }

  async update(userIdOrName: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = (await this.findByIdOrName(userIdOrName)).orElseThrow(
      () => new NotFoundResponse(`User not found: ${userIdOrName}`)
    )
    Object.assign(user, changes)
    return this.repository.save(user)
  }

  async updateLastActivity(user: UserEntity): Promise<void> {
    if (user.lastActivity < new Date(Date.now() - 5 * 60 * 1000)) {
      await this.repository.update(user.id, { lastActivity: new Date() })
    }
  }

  async delete(userIdOrName: string): Promise<UserEntity> {
    const user = (await this.findByIdOrName(userIdOrName)).orElseThrow(
      () => new NotFoundResponse(`User not found: ${userIdOrName}`)
    )
    this.logger.log(`Deleting user: ${user.username} - ${user.firstName} ${user.lastName} (id: ${user.id}) `)
    await this.repository.remove(user)
    return user
  }

  // TODO : Uncomment when we found a solution for the "Session" table
  async deleteInactiveUsers(): Promise<void> {
    // demo : Two weeks
    const demoThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    // student : One year
    // const studentThreshold = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    // teacher : Two years
    // const teacherThreshold = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)

    const demoUsers = await this.repository.find({ where: { role: UserRoles.demo } })
    // const students = await this.repository.find({ where: { role: UserRoles.student } })
    // const teachers = await this.repository.find({ where: { role: UserRoles.teacher } })

    const deletedIds: string[] = []

    const addInactiveUsersToDelete = (
      users: UserEntity[],
      threshold: Date,
      additionalCondition: (user: UserEntity) => boolean = () => true
    ) => {
      for (const user of users) {
        if (user.lastActivity < threshold && additionalCondition(user)) {
          deletedIds.push(user.id)
        }
      }
    }

    addInactiveUsersToDelete(demoUsers, demoThreshold)
    // addInactiveUsersToDelete(students, studentThreshold)
    // addInactiveUsersToDelete(teachers, teacherThreshold, (user) => user.username !== 'deleted_user')

    if (deletedIds.length > 0) {
      for (const id of deletedIds) {
        await this.delete(id)
      }
      this.eventEmitter.emit('deleteOrphanCircles')
      await this.updateResourceEvents(deletedIds)
      await this.deleteNotifications(deletedIds)
      await this.updateSessions(deletedIds)
    }
    this.logger.log(`Done deleting ${deletedIds.length} inactive users`)
  }

  private async updateResourceEvents(userId: string[]): Promise<void> {
    this.logger.log(`Updating ResourceEvents`)
    await this.repository.query(
      `UPDATE "ResourceEvents"
       SET "data" = jsonb_set("data"::jsonb, '{userId}', '"00000000-0000-0000-0000-000000000000"')
       WHERE "data"::jsonb ->> 'userId' = ANY($1)`,
      [userId]
    )
  }

  private async deleteNotifications(userId: string[]): Promise<void> {
    this.logger.log(`Deleting Notifications`)
    await this.repository.query(
      `DELETE FROM "Notifications"
       WHERE "data"::jsonb -> 'eventInfo' ->> 'actorId' = ANY($1)`,
      [userId]
    )
    await this.repository.query(
      `DELETE FROM "Notifications"
       WHERE "data"::jsonb -> 'eventInfo' -> 'data' ->> 'userId' = ANY($1)`,
      [userId]
    )
  }

  private async updateSessions(userId: string[]): Promise<void> {
    this.logger.log(`Updating Sessions`)
    await this.repository.query(
      `UPDATE "Sessions"
       SET
         "variables" = CASE
           WHEN "variables"::jsonb ->> 'author' = ANY($1)
           THEN jsonb_set("variables"::jsonb, '{author}', '"00000000-0000-0000-0000-000000000000"')
           ELSE "variables"
         END,
         "source" = CASE
           WHEN "source"::jsonb -> 'variables' ->> 'author' = ANY($1)
           THEN jsonb_set("source"::jsonb, '{variables,author}', '"00000000-0000-0000-0000-000000000000"')
           ELSE "source"
         END
       WHERE
         "variables"::jsonb ->> 'author' = ANY($1)
         OR "source"::jsonb -> 'variables' ->> 'author' = ANY($1)`,
      [userId]
    )
  }
}
