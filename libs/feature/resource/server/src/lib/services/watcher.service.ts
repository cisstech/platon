import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { ResourceWatcherEntity } from '../entities';

@Injectable()
export class ResourceWatcherService {
  constructor(
    @InjectRepository(ResourceWatcherEntity)
    private readonly repository: Repository<ResourceWatcherEntity>
  ) { }

  async findByUserId(resourceId: string, userId: string): Promise<Optional<ResourceWatcherEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { resourceId, userId }, relations: { user: true } })
    );
  }

  async findAll(resourceId: string): Promise<[ResourceWatcherEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId }, relations: { user: true } });
  }

  async create(input: Partial<ResourceWatcherEntity>): Promise<ResourceWatcherEntity> {
    return this.repository.save(
      this.repository.create(input)
    );
  }

  async updateByUserId(userId: string, changes: Partial<ResourceWatcherEntity>): Promise<ResourceWatcherEntity> {
    const resource = await this.repository.findOne({ where: { userId } })
    if (!resource) {
      throw new NotFoundException(`ResourceWatcher not found: ${userId}`)
    }
    Object.assign(resource, changes);
    return this.repository.save(resource);
  }

  async deleteByUserId(userId: string) {
    return this.repository.delete({ userId });
  }
}
