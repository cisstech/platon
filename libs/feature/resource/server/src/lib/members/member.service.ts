import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections, UserOrderings } from '@platon/core/common'
import { ResourceMemberFilters } from '@platon/feature/resource/common'
import { Repository } from 'typeorm'
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

    if (filters.order) {
      const fields: Record<UserOrderings, string> = {
        NAME: 'user.username',
        CREATED_AT: 'member.created_at',
        UPDATED_AT: 'member.updated_at',
      }

      const orderings: Record<UserOrderings, keyof typeof OrderingDirections> = {
        NAME: 'ASC',
        CREATED_AT: 'DESC',
        UPDATED_AT: 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    } else {
      query.orderBy('user.username', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
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
