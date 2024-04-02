import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CreateUserGroup,
  NotFoundResponse,
  UpdateUserGroup,
  UserGroupFilters,
  UserGroupOrderings,
  USER_GROUP_ORDERING_DIRECTIONS,
} from '@platon/core/common'
import { Repository } from 'typeorm'
import { UserEntity } from '../user.entity'
import { UserService } from '../user.service'
import { UserGroupEntity } from './user-group.entity'

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly repository: Repository<UserGroupEntity>,

    private readonly userService: UserService
  ) {}

  async search(filters: UserGroupFilters = {}): Promise<[UserGroupEntity[], number]> {
    const query = this.repository.createQueryBuilder('group')
    query.leftJoinAndSelect('group.users', 'users')

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(
        `(
        name ILIKE :search
      )`,
        { search: `%${search}%` }
      )
    }

    if (filters.order) {
      const fields: Record<UserGroupOrderings, string> = {
        NAME: 'name',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
      }

      query.orderBy(fields[filters.order], filters.direction || USER_GROUP_ORDERING_DIRECTIONS[filters.order])
    } else {
      query.orderBy('name', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    const [groups, count] = await query.getManyAndCount()
    groups.forEach((group) => this.cleanupGroupUsers(group))
    return [groups, count]
  }

  async create(group: Partial<UserGroupEntity>): Promise<UserGroupEntity> {
    const newGroup = await this.repository.save(this.repository.create(group))
    newGroup.users = []
    return newGroup
  }

  async update(groupId: string, changes: Partial<UserGroupEntity>): Promise<UserGroupEntity> {
    const group = await this.repository.findOne({
      where: { id: groupId },
      relations: {
        users: true,
      },
    })

    if (!group) {
      throw new NotFoundResponse(`UserGroup not found: ${groupId}`)
    }

    this.cleanupGroupUsers(group)

    Object.assign(group, changes)
    return this.repository.save(group)
  }

  async delete(groupId: string): Promise<void> {
    await this.repository.delete(groupId)
  }

  async fromInput(input: CreateUserGroup | UpdateUserGroup): Promise<UserGroupEntity> {
    const { users, ...props } = input

    const newRes = new UserGroupEntity()
    Object.assign(newRes, props)

    if (users) {
      newRes.users = await Promise.all(
        users.map(async (userIdOrName) => {
          const optional = await this.userService.findByIdOrName(userIdOrName)
          return optional.orElseThrow(() => new NotFoundResponse(`User not found: ${userIdOrName}`))
        })
      )
    }

    return newRes
  }

  async listMembers(groupId: string): Promise<UserEntity[]> {
    const group = await this.repository.findOne({
      where: { id: groupId },
      relations: {
        users: true,
      },
    })
    if (!group) {
      throw new NotFoundResponse(`UserGroup not found: ${groupId}`)
    }
    this.cleanupGroupUsers(group)
    return group.users
  }

  private cleanupGroupUsers(group: UserGroupEntity): void {
    group.users = group.users.filter((user) => user?.id)
  }
}
