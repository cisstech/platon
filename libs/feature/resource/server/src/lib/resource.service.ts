import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections } from '@platon/core/common'
import { LevelService, TopicService } from '@platon/core/server'
import {
  CircleTree,
  ResourceCompletion,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatisic,
  ResourceStatus,
  ResourceTypes,
  ResourceVisibilities,
} from '@platon/feature/resource/common'
import { isUUID4 } from '@platon/shared/server'
import { DataSource, EntityManager, Not, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceMemberEntity } from './members/member.entity'
import { CreateResourceDTO, UpdateResourceDTO } from './resource.dto'
import { ResourceEntity } from './resource.entity'
import { ResourceWatcherEntity } from './watchers'

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repository: Repository<ResourceEntity>,
    private readonly dataSource: DataSource,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService
  ) {}

  async tree(): Promise<CircleTree> {
    const circles = await this.repository.find({
      where: {
        type: ResourceTypes.CIRCLE,
        visibility: Not(ResourceVisibilities.PERSONAL),
      },
    })

    const root = circles.find((c) => !c.parentId) as ResourceEntity
    const tree: CircleTree = {
      id: root.id,
      name: root.name,
      code: root.code,
      visibility: root.visibility,
      children: [],
    }

    const traverse = (node: CircleTree) => {
      const children = circles.filter((c) => c.parentId === node.id).sort((a, b) => a.name.localeCompare(b.name))

      children.forEach((child) => {
        const next: CircleTree = {
          id: child.id,
          name: child.name,
          code: child.code,
          visibility: child.visibility,
          children: [],
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

  async statistic(id: string): Promise<ResourceStatisic> {
    return (
      this.dataSource.query('SELECT * FROM "ResourceStats" WHERE id = $1', [id]) as Promise<ResourceStatisic[]>
    ).then((response) => response[0])
  }

  async findById(id: string, resolveRelations = true): Promise<Optional<ResourceEntity>> {
    const query = this.repository.createQueryBuilder('resource')
    if (resolveRelations) {
      query.leftJoinAndSelect('resource.topics', 'topic')
      query.leftJoinAndSelect('resource.levels', 'level')
    }

    return Optional.ofNullable(await query.where('resource.id = :id', { id }).getOne())
  }

  async findByIdOrCode(idOrCode: string, resolveRelations = true): Promise<Optional<ResourceEntity>> {
    const query = this.repository.createQueryBuilder('resource')
    if (resolveRelations) {
      query.leftJoinAndSelect('resource.topics', 'topic')
      query.leftJoinAndSelect('resource.levels', 'level')
    }

    if (isUUID4(idOrCode)) {
      return Optional.ofNullable(await query.where('resource.id = :id', { id: idOrCode }).getOne())
    }
    return Optional.ofNullable(await query.where('resource.code = :code', { code: idOrCode }).getOne())
  }

  async findPersonal(ownerId: string): Promise<ResourceEntity> {
    let circle = await this.repository.findOne({
      where: {
        ownerId,
        type: ResourceTypes.CIRCLE,
        visibility: ResourceVisibilities.PERSONAL,
      },
    })

    if (!circle) {
      circle = await this.repository.save(
        this.repository.create({
          ownerId,
          name: 'Votre cercle personnel',
          desc: `Bienvenue dans votre cercle personnel dédié à la création de ressources pour vous entraîner à utiliser la plateforme en autonomie.
          Ici, vous pouvez créer des ressources qui ne seront visibles que par vous.
          `,
          type: ResourceTypes.CIRCLE,
          visibility: ResourceVisibilities.PERSONAL,
          status: ResourceStatus.READY,
        })
      )
    }
    return circle
  }

  async search(filters: ResourceFilters = {}): Promise<[ResourceEntity[], number]> {
    const query = this.repository.createQueryBuilder('resource')
    query.leftJoinAndSelect('resource.topics', 'topic')
    query.leftJoinAndSelect('resource.levels', 'level')

    filters = {
      ...filters,
      order: filters.order || ResourceOrderings.RELEVANCE,
    }

    if (filters.order === ResourceOrderings.RELEVANCE) {
      query.leftJoin('ResourceStats', 'stats', 'stats.id = resource.id')
    }

    if (filters.members?.length) {
      query.innerJoin(
        ResourceMemberEntity,
        'member',
        'member.resource_id = resource.id AND member.user_id IN (:...ids)',
        { ids: filters.members }
      )
    }

    if (filters.watchers?.length) {
      query.innerJoin(
        ResourceWatcherEntity,
        'watcher',
        'watcher.resource_id = resource.id AND watcher.user_id IN (:...ids)',
        { ids: filters.watchers }
      )
    }

    query.where('visibility <> :visibility', { visibility: ResourceVisibilities.PERSONAL })

    if (filters.parent) {
      query.andWhere('parent_id = :parent', { parent: filters.parent })
    }

    if (filters.types?.length) {
      query.andWhere('type IN (:...types)', { types: filters.types })
    }

    if (filters.status?.length) {
      query.andWhere('status IN (:...status)', { status: filters.status })
    }

    if (filters.owners?.length) {
      query.andWhere('owner_id IN (:...owners)', { owners: filters.owners })
    }

    if (filters.search) {
      query.andWhere(
        `(
        f_unaccent(resource.name) ILIKE f_unaccent(:search)
        OR f_unaccent(topic.name) ILIKE f_unaccent(:search)
        OR f_unaccent(level.name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${filters.search}%` }
      )
    }

    if (filters.period) {
      const subtractDays = (days: number): Date => {
        const result = new Date()
        result.setDate(result.getDate() - days)
        return result
      }
      query.andWhere('resource.updated_at >= :date', { date: subtractDays(filters.period) })
    }

    if (filters.order) {
      const fields: Record<ResourceOrderings, string> = {
        NAME: 'resource.name',
        CREATED_AT: 'resource.created_at',
        UPDATED_AT: 'resource.updated_at',
        RELEVANCE: 'stats.score',
      }

      const orderings: Record<ResourceOrderings, keyof typeof OrderingDirections> = {
        NAME: 'ASC',
        CREATED_AT: 'DESC',
        UPDATED_AT: 'DESC',
        RELEVANCE: 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async create(input: Partial<ResourceEntity>): Promise<ResourceEntity> {
    return this.repository.save(this.repository.create(input))
  }

  async update(id: string, changes: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource = await this.repository.findOne({ where: { id } })
    if (!resource) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }
    Object.assign(resource, changes)
    return this.repository.save(resource)
  }

  async completion(): Promise<ResourceCompletion> {
    const [levels, topics, names] = await Promise.all([
      this.levelService.findAll(),
      this.topicService.findAll(),
      this.repository.query('SELECT name FROM "Resources"') as Promise<{ name: string }[]>,
    ])

    return {
      levels: levels[0].map((e) => e.name),
      topics: topics[0].map((e) => e.name),
      names: names.map((e) => e.name),
    }
  }

  async fromInput(input: CreateResourceDTO | UpdateResourceDTO): Promise<ResourceEntity> {
    const { levels, topics, ...props } = input

    const newRes = new ResourceEntity()
    Object.assign(newRes, props)

    if (levels) {
      newRes.levels = await Promise.all(
        levels.map(async (levelId) => {
          const optional = await this.levelService.findById(levelId)
          return optional.orElseThrow(() => new NotFoundResponse(`Level not found: ${levelId}`))
        })
      )
    }

    if (topics) {
      newRes.topics = await Promise.all(
        topics.map(async (topicId) => {
          const optional = await this.topicService.findById(topicId)
          return optional.orElseThrow(() => new NotFoundResponse(`Topic not found: ${topicId}`))
        })
      )
    }

    return newRes
  }

  async notificationWatchers(resourceId: string, entityManager?: EntityManager): Promise<string[]> {
    const watchers = (
      await (entityManager ?? this.dataSource).query(
        `
      SELECT DISTINCT COALESCE(member.user_id, watcher.user_id, res.owner_id) AS user_id
      FROM "Resources" res
      LEFT JOIN "ResourceMembers" member ON member.resource_id = res.id
      LEFT JOIN "ResourceWatchers" watcher ON watcher.resource_id = res.id
      WHERE res.id = $1
    `,
        [resourceId]
      )
    )
      .map((row: Row) => row.user_id as string)
      .filter((userId: string) => !!userId)
    return watchers
  }
}

interface Row {
  user_id: string;
}
