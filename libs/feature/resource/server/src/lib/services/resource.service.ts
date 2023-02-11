import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderingDirections } from '@platon/core/common';
import { LevelService, TopicService } from '@platon/core/server';
import {
  CircleTree,
  ResourceCompletion,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
  ResourceVisibilities
} from '@platon/feature/resource/common';
import { In, Not, Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CreateResourceDTO, UpdateResourceDTO } from '../dto/resource.dto';
import { ResourceMemberEntity, ResourceWatcherEntity } from '../entities';
import { ResourceEntity } from '../entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repository: Repository<ResourceEntity>,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
  ) { }

  async tree(): Promise<CircleTree> {
    const circles = await this.repository.find({
      where: {
        type: ResourceTypes.CIRCLE,
        visibility: Not(ResourceVisibilities.PERSONAL)
      }
    })

    const root = circles.find(c => !c.parentId) as ResourceEntity;
    const tree: CircleTree = {
      id: root.id,
      name: root.name,
      children: []
    }

    const traverse = (node: CircleTree) => {
      const children = circles.filter(c => c.parentId === node.id)
        .sort((a, b) => a.name.localeCompare(b.name))

      children.forEach(child => {
        const next: CircleTree = {
          id: child.id,
          name: child.name,
          children: []
        }
        node.children?.push(next)
        traverse(next)
      })

      if (!node.children?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (node as any).children
      }
    }

    traverse(tree)

    return tree
  }

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

  async search(filters: ResourceFilters = {}): Promise<[ResourceEntity[], number]> {
    const query = this.repository.createQueryBuilder('resource')
    query.leftJoinAndSelect('resource.topics', 'topic')
    query.leftJoinAndSelect('resource.levels', 'level')

    if (filters.members) {
      query.innerJoin(ResourceMemberEntity, 'member', 'member.user_id IN (:...ids)', { ids: filters.members })
    }

    if (filters.watchers) {
      query.innerJoin(ResourceWatcherEntity, 'watcher', 'watcher.user_id IN (:...ids)', { ids: filters.watchers })
    }

    query.where('visibility <> :visibility', { visibility: ResourceVisibilities.PERSONAL })

    if (filters.parent) {
      query.andWhere('parent_id = :parent', { parent: filters.parent })
    }

    if (filters.types) {
      query.andWhere('type IN (:...types)', { types: filters.types })
    }

    if (filters.status) {
      query.andWhere('status IN (:...status)', { status: filters.status })
    }

    if (filters.owners) {
      query.andWhere('owner_id IN (:...owners)', { owners: filters.owners })
    }

    if (filters.search) {
      query.andWhere(`(
        f_unaccent(resource.name) ILIKE f_unaccent(:search)
        OR f_unaccent(topic.name) ILIKE f_unaccent(:search)
        OR f_unaccent(level.name) ILIKE f_unaccent(:search)
      )`, { search: `%${filters.search}%` })
    }

    if (filters.period) {
      const subtractDays = (days: number): Date => {
        const result = new Date();
        result.setDate(result.getDate() - days);
        return result;
      }
      query.andWhere('resource.updated_t >= :date', { date: subtractDays(filters.period) })
    }

    if (filters.order) {
      const fields: Record<ResourceOrderings, string> = {
        'NAME': 'name',
        'CREATED_AT': 'resource.created_at',
        'UPDATED_AT': 'resource.updated_at',
        'RELEVANCE': 'resource.updated_at', // TODO implements ranking
      }

      const orderings: Record<ResourceOrderings, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
        'RELEVANCE': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount();
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
