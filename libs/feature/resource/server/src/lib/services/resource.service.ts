import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LevelService, TopicService } from '@platon/core/server';
import {
  ResourceCompletion,
  ResourceFilters,
  ResourceStatus,
  ResourceTypes,
  ResourceVisibilities
} from '@platon/feature/resource/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
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

  async findPersonalCircle(ownerId: string): Promise<ResourceEntity> {
    let circle = await this.repository.findOne({
      where: {
        ownerId,
        type: ResourceTypes.CIRCLE,
        visibility: ResourceVisibilities.PERSONAL,
      }
    })

    if (!circle) {
      circle = (await this.repository.save(
        this.repository.create({
          ownerId,
          name: ownerId,
          type: ResourceTypes.CIRCLE,
          visibility: ResourceVisibilities.PERSONAL,
          status: ResourceStatus.READY
        })
      ))
    }
    return circle
  }

  async findAll(filters: ResourceFilters = {}): Promise<[ResourceEntity[], number]> {
    console.log(filters)
    return this.repository.findAndCount();
  }

  async create(input: Partial<ResourceEntity>): Promise<ResourceEntity> {
    return this.repository.save(input);
  }

  async update(id: string, changes: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource = await this.repository.findOne({ where: { id } })
    if (!resource) {
      throw new NotFoundException(`Resource not found: ${id}`)
    }
    Object.assign(resource, changes);
    return this.repository.save(resource);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async completion(): Promise<ResourceCompletion> {
    const [levels, topics, names] = await Promise.all([
      this.levelService.findAll(),
      this.topicService.findAll(),
      this.repository.query('SELECT name FROM "Resources"') as Promise<{ name: string }[]>
    ])

    return {
      levels: levels[0].map(e => e.name),
      topics: topics[0].map(e => e.name),
      names: names.map(e => e.name),
    }
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
