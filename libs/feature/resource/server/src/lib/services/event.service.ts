import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceEventFilters } from '@platon/feature/resource/common';
import { Repository } from 'typeorm';
import { ResourceEventEntity } from '../entities/event.entity';

@Injectable()
export class ResourceEventService {
  constructor(
    @InjectRepository(ResourceEventEntity)
    private readonly repository: Repository<ResourceEventEntity>
  ) { }

  async search(
    resourceId: string,
    filters: ResourceEventFilters = {}
  ): Promise<[ResourceEventEntity[], number]> {
    const query = this.repository.createQueryBuilder('watcher')
    query.where('resource_id = :resourceId', { resourceId })

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async create(input: Partial<ResourceEventEntity>): Promise<ResourceEventEntity> {
    return this.repository.save(input);
  }
}
