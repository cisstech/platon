import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LevelService, TopicService } from '@platon/core/server';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { CreateResourceDTO, UpdateResourceDTO } from '../dto/resource.dto';
import { ResourceEntity } from '../entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repository: Repository<ResourceEntity>,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
  ) { }

  async findById(id: string): Promise<Optional<ResourceEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { id } })
    );
  }

  async findAll(): Promise<[ResourceEntity[], number]> {
    return this.repository.findAndCount();
  }

  async create(input: Partial<ResourceEntity>): Promise<ResourceEntity> {
    return this.repository.save(input);
  }

  async update(id: string, changes: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource = await this.repository.findOne({ where: { id }})
    if (!resource) {
      throw new NotFoundException(`Resource not found: ${id}`)
    }
    Object.assign(resource, changes);
    return this.repository.save(resource);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async fromInput(input: CreateResourceDTO | UpdateResourceDTO): Promise<ResourceEntity> {
    const { levels, topics, ...props } = input;

    const newRes = new ResourceEntity()
    Object.assign(newRes, props);

    if (levels) {
      newRes.levels = (await Promise.all(
        levels.map(level => this.levelService.findById(level))
      )).map(optional => optional.orElseThrow(() => new BadRequestException(`Level not found: ${levels}`)))
    }

    if (topics) {
      newRes.topics = (await Promise.all(
        topics.map(topic => this.topicService.findById(topic))
      )).map(optional => optional.orElseThrow(() => new BadRequestException(`Topic not found: ${topics}`)))
    }

    return newRes
  }
}
