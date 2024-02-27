import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestResponse, NotFoundResponse, UserOrderings, USER_ORDERING_DIRECTIONS } from '@platon/core/common'
import { ResourceMemberFilters } from '@platon/feature/resource/common'
import { EntityManager, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceMemberEntity } from './member.entity'

@Injectable()
export class ResourceMemberService {
  constructor(
    @InjectRepository(ResourceMemberEntity)
    private readonly repository: Repository<ResourceMemberEntity>
  ) {}

  async findByUserId(resourceId: string, userId: string): Promise<Optional<ResourceMemberEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { resourceId, userId } }))
  }

  async findAllByUserId(userId: string): Promise<ResourceMemberEntity[]> {
    return this.repository.find({ where: { userId } })
  }

  async search(resourceId: string, filters: ResourceMemberFilters = {}): Promise<[ResourceMemberEntity[], number]> {
    const query = this.repository.createQueryBuilder('member')
    query.leftJoinAndSelect('member.user', 'user', 'user.id = member.user_id')
    query.where('resource_id = :resourceId', { resourceId })

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

    if (filters.waiting != null) {
      query.andWhere('member.waiting = :waiting', { waiting: filters.waiting })
    }

    const fields: Record<UserOrderings, string> = {
      NAME: 'user.username',
      CREATED_AT: 'member.created_at',
      UPDATED_AT: 'member.updated_at',
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

  async create(input: Partial<ResourceMemberEntity>, manager?: EntityManager): Promise<ResourceMemberEntity> {
    const member = manager
      ? await manager.findOne(ResourceMemberEntity, {
          where: { resourceId: input.resourceId, userId: input.userId },
        })
      : await this.repository.findOne({ where: { resourceId: input.resourceId, userId: input.userId } })

    if (member) {
      throw new BadRequestResponse('There is already a member entry for the given user')
    }

    return manager
      ? manager.save(manager.create(ResourceMemberEntity, input as ResourceMemberEntity))
      : this.repository.save(this.repository.create(input))
  }

  async updateByUserId(
    resourceId: string,
    userId: string,
    changes: Partial<ResourceMemberEntity>
  ): Promise<ResourceMemberEntity> {
    const resource = await this.repository.findOne({ where: { resourceId, userId } })
    if (!resource) {
      throw new NotFoundResponse(`ResourceMember not found: ${userId}`)
    }
    Object.assign(resource, changes)
    return this.repository.save(resource)
  }

  async deleteByUserId(resourceId: string, userId: string) {
    return this.repository.remove(
      (await this.findByUserId(resourceId, userId)).orElseThrow(
        () => new NotFoundResponse(`ResourceMember not found: ${userId}`)
      )
    )
  }
}
