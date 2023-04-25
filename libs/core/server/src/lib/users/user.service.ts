import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, OrderingDirections, UserFilters, UserOrderings } from '@platon/core/common';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) { }

  async findById(id: string): Promise<Optional<UserEntity>> {
    const result =  await this.repository.findOne({ where: { id } })
    return Optional.ofNullable(result);
  }

  async findByUsername(username: string): Promise<Optional<UserEntity>> {
    const result =  await this.repository.findOne({ where: { username } })
    return Optional.ofNullable(result);
  }

  async findByIdOrName(userIdOrName: string): Promise<Optional<UserEntity>> {
    const result = userIdOrName.includes('-')
      ? await this.repository.findOne({ where: { id: userIdOrName } })
      : await this.repository.findOne({ where: { username: userIdOrName } })
    return Optional.ofNullable(result);
  }

  async search(filters: UserFilters = {}): Promise<[UserEntity[], number]> {
    const query = this.repository.createQueryBuilder('user')

    if (filters.groups?.length) {
      query.innerJoin(
        'UserGroupsUsers',
        'group',
        'group.user_id = user.id AND group.group_id IN (:...ids)',
        { ids: filters.groups
      })
    }

    if (filters.lmses?.length) {
      query.innerJoin(
        'LmsUsers',
        'lms_user',
        'lms_user.user_id = user.id AND lms_user.lms_id IN (:...ids)',
        { ids: filters.lmses
      })
    }

    if (filters.roles?.length) {
      query.andWhere('role IN (:...roles)', { roles: filters.roles })
    }

    if (filters.search) {
      query.andWhere(`(
        username ILIKE :search
        OR email ILIKE :search
        OR f_unaccent(first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(last_name) ILIKE f_unaccent(:search)
      )`, { search: `%${filters.search}%` })
    }

    if (filters.order) {
      const fields: Record<UserOrderings, string> = {
        'NAME': 'username',
        'CREATED_AT': 'created_at',
        'UPDATED_AT': 'updated_at',
      }

      const orderings: Record<UserOrderings, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    } else {
      query.orderBy('username', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount();
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repository.save(user);
  }

  async update(userIdOrName: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = (
      await this.findByIdOrName(userIdOrName)
    ).orElseThrow(() => new NotFoundResponse(`User not found: ${userIdOrName}`));
    Object.assign(user, changes);
    return this.repository.save(user);
  }
}
