import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, UserFilters, UserOrderings, USER_ORDERING_DIRECTIONS } from '@platon/core/common'
import { isUUID4 } from '@platon/shared/server'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
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

    if (filters.search) {
      query.andWhere(
        `(
        username ILIKE :search
        OR email ILIKE :search
        OR f_unaccent(first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(last_name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${filters.search}%` }
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
}
