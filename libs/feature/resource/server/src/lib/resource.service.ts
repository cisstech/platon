import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, User } from '@platon/core/common'
import {
  EventService,
  LevelService,
  TopicService,
  UserEntity,
  ON_TOPIC_FUSION_EVENT,
  ON_LEVEL_FUSION_EVENT,
  OnLevelFusionEventPayload,
  OnTopicFusionEventPayload,
} from '@platon/core/server'
import {
  CircleTree,
  RESOURCE_ORDERING_DIRECTIONS,
  ResourceCompletion,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
  circleTreeFromCircleList,
} from '@platon/feature/resource/common'
import { isUUID4 } from '@platon/shared/server'
import { Brackets, DataSource, EntityManager, In, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceDependencyEntity } from './dependency'
import { ResourceMemberEntity } from './members/member.entity'
import { ResourceMetaEntity } from './metadata/metadata.entity'
import { CreateResourceDTO, UpdateResourceDTO } from './resource.dto'
import { ResourceEntity } from './resource.entity'
import { ON_CREATE_RESOURCE_EVENT, OnCreateResourceEventPayload } from './resource.event'
import { ResourceStatisticEntity } from './statistics'
import { ResourceWatcherEntity } from './watchers'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name)

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

  /**
   * Build tree structure from a list of circles representing the hiearchy between them.
   * @param circles list of circles to build the tree from
   * @throws
   *  - NotFoundResponse if there is no root circle in the list
   * @returns Promise<CircleTree> - the tree structure
   */
  async tree(circles: ResourceEntity[]): Promise<CircleTree> {
    const metas = circles.length
      ? await this.metadataRepo.find({ where: { resourceId: In(circles.map((c) => c.id)) } })
      : []

    const versions: Record<string, string[]> = metas.reduce((acc, curr) => {
      acc[curr.resourceId] = curr.meta.versions.map((v) => v.tag)
      return acc
    }, {} as Record<string, string[]>)

    return circleTreeFromCircleList(circles, versions)
  }

  /**
   * Retrieves a resource by its ID.
   * @param id - The ID of the resource to retrieve.
   * @param resolveTags - If true, the resource's `topics` and `levels` are loaded.
   * @returns A Promise that resolves to the retrieved ResourceEntity.
   * @throws Error if the resource with the specified ID is not found.
   */
  async getById(id: string, resolveTags = true): Promise<ResourceEntity> {
    const query = this.repository.createQueryBuilder('resource')
    if (resolveTags) {
      query.leftJoinAndSelect('resource.topics', 'topic')
      query.leftJoinAndSelect('resource.levels', 'level')
    }

    return query.where('resource.id = :id', { id }).getOneOrFail()
  }

  /**
   * Finds a resource by its ID or code.
   * @param idOrCode - The ID or code of the resource.
   * @param resolveTags - If true, the resource's `topics` and `levels` are loaded.
   * @returns A Promise that resolves to an Optional containing the found resource entity, or null if not found.
   */
  async findByIdOrCode(idOrCode: string, resolveTags = true): Promise<Optional<ResourceEntity>> {
    const query = this.repository.createQueryBuilder('resource')
    if (resolveTags) {
      query.leftJoinAndSelect('resource.topics', 'topic')
      query.leftJoinAndSelect('resource.levels', 'level')
    }

    if (isUUID4(idOrCode)) {
      return Optional.ofNullable(await query.where('resource.id = :id', { id: idOrCode }).getOne())
    }
    return Optional.ofNullable(await query.where('resource.code = :code', { code: idOrCode }).getOne())
  }

  /**
   * Finds the personal resource for a given owner.
   * If the personal resource does not exist, it creates a new one and returns it.
   *
   * @param owner - The owner of the personal resource.
   * @returns A Promise that resolves to the personal resource entity.
   */
  async getPersonal(owner: UserEntity): Promise<ResourceEntity> {
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

  /**
   * Finds all descendant circles of a given circle.
   * @remarks
   * - The resource itself is not included in the result.
   * - Personal circles are always excluded.
   * - Passing the id of an personal circle will return an empty array.
   * @param circleId - The ID of the circle to find descendant circles for.
   * @returns A promise that resolves to an array of descendant circles.
   */
  async getDescendants(circleId: string): Promise<ResourceEntity[]> {
    const circles = await this.repository.find({
      where: { type: ResourceTypes.CIRCLE, personal: false },
    })

    const root = circles.find((c) => c.id === circleId)
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
   * Search resources to display
   * @param filters filters to apply to the search
   * @param userId user id to check permissions on resources - if not provided, no permissions are checked
   * @returns Promise<[ResourceEntity[], number]> - the list of resources and the total count
   */
  async search(filters: ResourceFilters = {}, userId?: string): Promise<[ResourceEntity[], number]> {
    const query = this.repository.createQueryBuilder('resource')

    // Checking is user has permissions to see resources ie. is a member or a watcher
    const userHasPermissions = async (userId: string) => {
      const resourcesVisibleByUser = await this.dataSource.query(
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
      const resources = [...resourcesVisibleByUser].map((e) => e.resource_id)
      query.andWhere(
        new Brackets((qb) => {
          if (resources.length > 0) {
            qb.where('resource.id IN (:...resources)', { resources })
            qb.orWhere('parent_id IN (:...resources)', { resources })
          }
          qb.orWhere('owner_id = :userId', { userId })
          qb.orWhere('personal = false')
        })
      )
    }
    if (userId) await userHasPermissions(userId)

    query.leftJoinAndSelect('resource.topics', 'topic')
    query.leftJoinAndSelect('resource.levels', 'level')

    if (filters.configurable != null || filters.navigation != null) {
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

    if (filters.antiTopics?.length) {
      query.andWhere(
        `resource.id NOT IN (
        SELECT r.id FROM "Resources" r
        INNER JOIN "ResourceTopics" rt ON r.id = rt.resource_id
        WHERE rt.topic_id IN (:...antiTopics)
    )`,
        { antiTopics: filters.antiTopics }
      )
    }

    // Need to be done after antiTopics filtering
    if (filters.topics?.length) {
      query.andWhere('topic_id IN (:...topics)', { topics: filters.topics })
    }

    if (filters.publicPreview != null) {
      query.andWhere('public_preview = :publicPreview', { publicPreview: filters.publicPreview })
    }

    if (filters.configurable != null) {
      query.andWhere(`(type <> 'EXERCISE' OR metadata.meta->'configurable' = :configurable)`, {
        configurable: filters.configurable,
      })
    }

    if (filters.navigation) {
      query.andWhere(`(type <> 'ACTIVITY' OR metadata.meta->'settings'->'navigation'->>'mode' = :navigation)`, {
        navigation: filters.navigation,
      })
    }

    if (filters.personal != null) {
      query.andWhere('personal = :personal', { personal: filters.personal })
    }

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(
        `(
        f_unaccent(resource.name) ILIKE f_unaccent(:search)
        OR f_unaccent(topic.name) ILIKE f_unaccent(:search)
        OR f_unaccent(level.name) ILIKE f_unaccent(:search)
      )`,
        { search: `%${search}%` }
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

  /**
   * Creates a new resource entity.
   *
   * @param input - The partial resource entity to create.
   * @returns A promise that resolves to the created resource entity.
   */
  async create(input: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const parent = await this.repository.findOneOrFail({ where: { id: input.parentId } })
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

  async delete(resource: ResourceEntity): Promise<void> {
    await this.repository.remove(resource)
  }

  /**
   * Updates a resource with the specified changes.
   * @remarks
   * - Passing a resource object instead of an id is encouraged if possible to prevent unecessary database call for retrieving it.
   *
   * @Throws - `NotFoundResponse` error if the resource is not found.
   *
   * @param idOrResource - The ID of the resource or the `ResourceEntity` object.
   * @param changes - The partial changes to be applied to the resource.
   * @returns A promise that resolves to the updated `ResourceEntity` object.
   * @throws `NotFoundResponse` if the resource is not found.
   */
  async update(idOrResource: string | ResourceEntity, changes: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource =
      typeof idOrResource === 'string'
        ? await this.repository.findOne({
            where: { id: idOrResource },
          })
        : idOrResource

    if (!resource) {
      throw new NotFoundResponse(`Resource not found: ${idOrResource}`)
    }

    Object.assign(resource, changes)
    return this.repository.save(resource)
  }

  async move(id: string, parentId: string): Promise<ResourceEntity> {
    const resource = await this.repository.findOneOrFail({ where: { id } })
    const parent = await this.repository.findOneOrFail({ where: { id: parentId } })

    resource.parentId = parent.id
    return this.repository.save(resource)
  }

  /**
   * Retrieves the resources search completion data for a user.
   * @param user - The user entity.
   * @returns A promise that resolves to a `ResourceCompletion` object containing the completion data.
   */
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

  /**
   * Converts an input object of type `CreateResourceDTO` or `UpdateResourceDTO` to a `ResourceEntity` object while loading
   * `levels` and `topics` relations if they are specified.
   * @param input - The input object to convert.
   * @returns A promise that resolves to a `ResourceEntity` object.
   */
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

  /**
   * Retrieves the list of user IDs who are intended to receive notifications for a resource.
   * @remarks
   * - The list of user IDs is determined by the resource's owner, members, and watchers.
   *
   * @param resourceId - The ID of the resource.
   * @param entityManager - Optional. The entity manager to use for the database query.
   * @returns A promise that resolves to an array of user IDs.
   */
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

  async getAllOwners(): Promise<User[]> {
    const owners: User[] = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .innerJoin('Resources', 'rt', 'rt.owner_id = u.id')
      .where('u.role = :role', { role: 'teacher' })
      .andWhere('u.username NOT LIKE :prefix', { prefix: 'Didapro%' })
      .distinct(true)
      .select('u')
      .getMany()
    return owners
  }

  @OnEvent('deleteOrphanCircles')
  async handleDeleteOrphanCircles() {
    const personalCircles = await this.repository.find({
      where: {
        ownerId: '00000000-0000-0000-0000-000000000000',
        type: ResourceTypes.CIRCLE,
        personal: true,
      },
    })
    personalCircles.forEach(async (circle) => {
      this.logger.log(`Deleting personal circle: ${circle.name} (id: ${circle.id})`)
      await this.delete(circle)
    })
  }

  @OnEvent(ON_TOPIC_FUSION_EVENT)
  async onTopicFusion(payload: OnTopicFusionEventPayload) {
    const { oldTopic, newTopic } = payload
    const resources = await this.repository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.topics', 'topic')
      .getMany()
    await Promise.all(
      resources.map((resource) => {
        resource.topics = resource.topics.map((t) => (t.id === oldTopic.id ? newTopic : t))
        return this.repository.save(resource)
      })
    )
    Logger.log(`Merging topics ${oldTopic.name} into ${newTopic.name}`, 'ResourceService')
  }

  @OnEvent(ON_LEVEL_FUSION_EVENT)
  async onLevelFusion(payload: OnLevelFusionEventPayload) {
    const { oldLevel, newLevel } = payload
    const resources = await this.repository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.levels', 'level')
      .getMany()
    await Promise.all(
      resources.map((resource) => {
        resource.levels = resource.levels.map((l) => (l.id === oldLevel.id ? newLevel : l))
        return this.repository.save(resource)
      })
    )
    Logger.log(`Merging levels ${oldLevel.name} into ${newLevel.name}`, 'ResourceService')
  }
}
