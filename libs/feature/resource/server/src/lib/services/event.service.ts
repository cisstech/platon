import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEventEntity } from '../entities/event.entity';

@Injectable()
export class ResourceEventService {
  constructor(
    @InjectRepository(ResourceEventEntity)
    private readonly repository: Repository<ResourceEventEntity>
  ) { }

  async findAll(resourceId: string): Promise<[ResourceEventEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId }});
  }

  async create(user: Partial<ResourceEventEntity>): Promise<ResourceEventEntity> {
    return this.repository.save(user);
  }
}
