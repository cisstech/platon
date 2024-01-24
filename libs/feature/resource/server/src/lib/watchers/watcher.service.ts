import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections, UserOrderings } from '@platon/core/common'
import { ResourceWatcherFilters } from '@platon/feature/resource/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceWatcherEntity } from './watcher.entity'

@Injectable()
export class ResourceWatcherService {
  constructor(
    @InjectRepository(ResourceWatcherEntity)
    private readonly repository: Repository<ResourceWatcherEntity>
  ) {}

  async findByUserId(resourceId: string, userId: string): Promise<Optional<ResourceWatcherEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { resourceId, userId }, relations: { user: true } })
    )
  }

  async findAllByUserId(userId: string): Promise<ResourceWatcherEntity[]> {
    return this.repository.find({ where: { userId } })
  }

  async search(resourceId: string, filters: ResourceWatcherFilters = {}): Promise<[ResourceWatcherEntity[], number]> {
    const query = this.repository.createQueryBuilder('watcher')
    query.leftJoinAndSelect('watcher.user', 'user', 'user.id = watcher.user_id')
    query.where('watcher.resource_id = :resourceId', { resourceId })

    if (filters.search) {
      query.andWhere(
        `(
        user.username ILIKE :search
        OR user.email ILIKE :search
        OR f_unaccent(user.first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(user.last_name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${filters.search}%` }
      )
    }

    const fields: Record<UserOrderings, string> = {
      NAME: 'user.username',
      CREATED_AT: 'watcher.created_at',
      UPDATED_AT: 'watcher.updated_at',
    }

    const orderings: Record<UserOrderings, keyof typeof OrderingDirections> = {
      NAME: 'ASC',
      CREATED_AT: 'DESC',
      UPDATED_AT: 'DESC',
    }

    const order = filters.order || UserOrderings.NAME
    const direction = filters.direction || orderings[order]
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

  async create(input: Partial<ResourceWatcherEntity>): Promise<ResourceWatcherEntity> {
    return this.repository.save(this.repository.create(input))
  }

  async updateByUserId(
    resourceId: string,
    userId: string,
    changes: Partial<ResourceWatcherEntity>
  ): Promise<ResourceWatcherEntity> {
    const resource = await this.repository.findOne({ where: { resourceId, userId } })
    if (!resource) {
      throw new NotFoundResponse(`ResourceWatcher not found: ${userId}`)
    }
    Object.assign(resource, changes)
    return this.repository.save(resource)
  }

  async deleteByUserId(resourceId: string, userId: string) {
    return this.repository.delete({ resourceId, userId })
  }
}
