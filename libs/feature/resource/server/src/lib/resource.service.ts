import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { EventService, LevelService, TopicService, UserEntity } from '@platon/core/server'
import {
  CircleTree,
  RESOURCE_ORDERING_DIRECTIONS,
  ResourceCompletion,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { isUUID4 } from '@platon/shared/server'
import { DataSource, EntityManager, In, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceDependencyEntity } from './dependency'
import { ResourceMemberEntity } from './members/member.entity'
import { ResourceMetaEntity } from './metadata/metadata.entity'
import { CreateResourceDTO, UpdateResourceDTO } from './resource.dto'
import { ResourceEntity } from './resource.entity'
import { ON_CREATE_RESOURCE_EVENT, OnCreateResourceEventPayload } from './resource.event'
import { ResourceStatisticEntity } from './statistics'
import { ResourceWatcherEntity } from './watchers'

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly repository: Repository<ResourceEntity>,

    @InjectRepository(ResourceMetaEntity)
    private readonly metadataRepo: Repository<ResourceMetaEntity>,
    private readonly dataSource: DataSource,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
    private readonly eventService: EventService
  ) {}

  async tree(circles: ResourceEntity[]): Promise<CircleTree> {
    const root = circles.find((c) => !c.parentId && !c.personal) as ResourceEntity
    const metas = circles.length
      ? await this.metadataRepo.find({
          where: {
            resourceId: In(circles.map((c) => c.id)),
          },
        })
      : []

    const metasMap = metas.reduce((acc, meta) => {
      acc[meta.resourceId] = meta
      return acc
    }, {} as Record<string, ResourceMetaEntity>)

    const tree: CircleTree = {
      id: root.id,
      name: root.name,
      code: root.code,
      children: [],
      versions: metasMap[root.id]?.meta?.versions?.map((v) => v.tag) || [],
      permissions: {
        read: true,
        write: true,
        watcher: true,
        member: false,
        waiting: false,
      },
    }

    const traverse = (node: CircleTree) => {
      const children = circles.filter((c) => c.parentId === node.id).sort((a, b) => a.name.localeCompare(b.name))

      children.forEach((child) => {
        const next: CircleTree = {
          id: child.id,
          name: child.name,
          code: child.code,
          versions: metasMap[child.id]?.meta?.versions?.map((v) => v.tag) || [],
          permissions: {
            read: true,
            write: true,
            watcher: true,
            member: false,
            waiting: false,
          },
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

  async getById(id: string): Promise<ResourceEntity> {
    return (await this.findById(id)).orElseThrow(() => new NotFoundResponse(`Resource not found: ${id}`))
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

  async findPersonal(owner: UserEntity): Promise<ResourceEntity> {
    let circle = await this.repository.findOne({
      where: {
        ownerId: owner.id,
        type: ResourceTypes.CIRCLE,
        personal: true,
      },
    })

    if (!circle) {
      circle = await this.repository.save(
        this.repository.create({
          ownerId: owner.id,
          name: owner.username,
          desc: `Bienvenue dans votre cercle personnel dédié à la création de ressources pour vous entraîner à utiliser la plateforme en autonomie.
          Ici, vous pouvez créer des ressources qui ne seront visibles que par vous.
          `,
          type: ResourceTypes.CIRCLE,
          code: owner.username,
          personal: true,
          status: ResourceStatus.READY,
        })
      )
    }
    return circle
  }

  async findDescendantCircles(resourceId: string): Promise<ResourceEntity[]> {
    const circles = await this.repository.find({
      where: {
        type: ResourceTypes.CIRCLE,
      },
    })

    const root = circles.find((c) => c.id === resourceId)
    if (!root) {
      return []
    }

    const descendants: ResourceEntity[] = []

    const traverse = (node: ResourceEntity) => {
      const children = circles.filter((c) => c.parentId === node.id)

      children.forEach((child) => {
        descendants.push(child)
        traverse(child)
      })
    }

    traverse(root)

    return descendants
  }

  /**
   * Search resources to display on workspace
   * @param filters filters to apply to the search
   * @param userId user id to check permissions on resources - if not provided, no permissions are checked
   * @returns Promise<[ResourceEntity[], number]> - the list of resources and the total count
   */
  async search(filters: ResourceFilters = {}, userId?: string): Promise<[ResourceEntity[], number]> {
    const query = this.repository.createQueryBuilder('resource')

    // Checking is user has permissions to see resources ie. is a member or a watcher
    const userHasPermissions = async (userId: string) => {
      const resourcesVisibleByUser = this.dataSource.query(
        `
        SELECT DISTINCT resource_id
        FROM "ResourceMembers" rm
        WHERE user_id = $1
        AND "rm"."permissionsRead"
        UNION
        SELECT DISTINCT resource_id
        FROM "ResourceWatchers"
        WHERE user_id = $1
      `,
        [userId]
      )
      const resources = [...(await resourcesVisibleByUser)].map((e) => e.resource_id)
      query.andWhere('resource.id IN (:...resources)', { resources })
    }
    if (userId) await userHasPermissions(userId)

    query.leftJoinAndSelect('resource.topics', 'topic')
    query.leftJoinAndSelect('resource.levels', 'level')

    if (filters.configurable || filters.navigation != null) {
      query.leftJoin('ResourceMeta', 'metadata', 'metadata.resource_id = resource.id')
    }

    filters = {
      ...filters,
      order: filters.order || ResourceOrderings.RELEVANCE,
    }

    if (filters.order === ResourceOrderings.RELEVANCE) {
      query.leftJoinAndSelect(ResourceStatisticEntity, 'stats', 'stats.id = resource.id')
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

    if (filters.dependOn?.length) {
      query.innerJoin(
        ResourceDependencyEntity,
        'dependency',
        'dependency.resource_id = resource.id AND dependency.depend_on_id IN (:...ids)',
        { ids: filters.dependOn }
      )
    }

    if (filters.usedBy?.length) {
      query.innerJoin(
        ResourceDependencyEntity,
        'dependency',
        'dependency.depend_on_id = resource.id AND dependency.resource_id IN (:...ids)',
        { ids: filters.usedBy }
      )
    }

    if (filters.parents?.length) {
      query.andWhere('parent_id IN(:...parents)', { parents: filters.parents })
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

    if (filters.levels?.length) {
      query.andWhere('level_id IN (:...levels)', { levels: filters.levels })
    }

    if (filters.topics?.length) {
      query.andWhere('topic_id IN (:...topics)', { topics: filters.topics })
    }

    if (filters.publicPreview) {
      query.andWhere('public_preview = true')
    }

    if (filters.configurable) {
      query.andWhere(`(type <> 'EXERCISE' OR metadata.meta->'configurable' = 'true')`)
    }

    if (filters.navigation) {
      query.andWhere(`(type <> 'ACTIVITY' OR metadata.meta->'settings'->'navigation'->>'mode' = :navigation)`, {
        navigation: filters.navigation,
      })
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
        CREATED_AT: 'resource.createdAt',
        UPDATED_AT: 'resource.updatedAt',
        RELEVANCE: 'stats.score',
      }

      query.orderBy(fields[filters.order], filters.direction || RESOURCE_ORDERING_DIRECTIONS[filters.order])
    }

    if (filters.offset) {
      query.skip(filters.offset)
    }

    if (filters.limit) {
      query.take(filters.limit)
    }

    return query.getManyAndCount()
  }

  async create(input: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const parent = (await this.findById(input.parentId!)).get()
    const resource = await this.repository.save(
      this.repository.create({
        ...input,
        personal: parent.personal,
      })
    )

    this.eventService.emit<OnCreateResourceEventPayload>(ON_CREATE_RESOURCE_EVENT, {
      resource,
    })

    return resource
  }

  async update(idOrResource: string | ResourceEntity, changes: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource =
      typeof idOrResource === 'string'
        ? await this.repository.findOne({
            where: {
              id: idOrResource,
            },
          })
        : idOrResource

    if (!resource) {
      throw new NotFoundResponse(`Resource not found: ${idOrResource}`)
    }

    Object.assign(resource, changes)
    return this.repository.save(resource)
  }

  async completion(user: UserEntity): Promise<ResourceCompletion> {
    const [levels, topics, names] = await Promise.all([
      this.levelService.findAll(),
      this.topicService.findAll(),
      this.repository.find({
        where: [{ personal: true, ownerId: user.id }, { personal: false }],
        select: ['name'],
      }),
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
      .map(({ user_id }: { user_id: string }) => user_id as string)
      .filter((userId: string) => !!userId)
    return watchers
  }
}
