import { Expandable, Selectable } from '@cisstech/nestjs-expand'
import { Body, Controller, Delete, Get, Logger, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  CreatedResponse,
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NotFoundResponse,
  User,
} from '@platon/core/common'
import { IRequest, Mapper, UserService, UUIDParam } from '@platon/core/server'
import { ResourceCompletionDTO } from './completion'
import { ResourcePermissionService } from './permissions/permissions.service'
import { CircleTreeDTO, CreateResourceDTO, ResourceDTO, ResourceFiltersDTO, UpdateResourceDTO } from './resource.dto'
import { ResourceService } from './resource.service'
import { ResourceViewService } from './views/view.service'
import { NotificationService } from '@platon/feature/notification/server'
import { ResourceMovedByAdminNotification } from '@platon/feature/course/common'
import { ResourceFileService } from './files'

@Controller('resources')
@ApiTags('Resources')
export class ResourceController {
  private readonly logger = new Logger(ResourceController.name)

  constructor(
    private readonly resourceService: ResourceService,
    private readonly permissionService: ResourcePermissionService,
    private readonly resourceViewService: ResourceViewService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly fileService: ResourceFileService
  ) {}

  @Get()
  @Expandable(ResourceDTO, { rootField: 'resources' })
  @Selectable({ rootField: 'resources' })
  async search(@Req() req: IRequest, @Query() filters: ResourceFiltersDTO = {}): Promise<ListResponse<ResourceDTO>> {
    let resources: ResourceDTO[] = []
    let total = 0
    if (filters.views) {
      const response = await this.resourceViewService.findAll(req.user.id)
      resources = Mapper.mapAll(
        response[0].map((r) => r.resource),
        ResourceDTO
      )
      total = response[1]
    } else {
      const response = await this.resourceService.search(filters, req.user.id) // returns only resources the user has read access to
      resources = Mapper.mapAll(response[0], ResourceDTO)
      total = response[1]
    }
    return new ListResponse({ total, resources })
  }

  @Get('/tree')
  async tree(@Req() req: IRequest): Promise<ItemResponse<CircleTreeDTO>> {
    const [circles] = await this.resourceService.search({
      types: ['CIRCLE'],
      personal: false,
    })
    await this.resourceService.getPersonal(req.user).then((personal) => circles.push(personal))

    const tree = Mapper.map(await this.resourceService.tree(circles), CircleTreeDTO)
    const permissions = await this.permissionService.userPermissionsOnResources(circles, req)

    const injectPermissions = (tree: CircleTreeDTO) => {
      const perms = permissions.find((p) => p.resource.id === tree.id)?.permissions
      if (perms) {
        Object.assign<CircleTreeDTO, Partial<CircleTreeDTO>>(tree, { permissions: perms })
      }
      tree.children?.forEach((child) => injectPermissions(child))
    }

    injectPermissions(tree)

    return new ItemResponse({ resource: tree })
  }

  @Get('/completion')
  async completion(@Req() req: IRequest): Promise<ItemResponse<ResourceCompletionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(await this.resourceService.completion(req.user), ResourceCompletionDTO),
    })
  }

  @Get('/owners')
  async listOwners(): Promise<ListResponse<User>> {
    const owners = await this.resourceService.getAllOwners()
    return new ListResponse({ resources: owners, total: owners.length })
  }

  @Get('/:id')
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async find(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Query('markAsViewed') markAsViewed?: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const optional = await this.resourceService.findByIdOrCode(id)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Resource not found: ${id}`)),
      ResourceDTO
    )

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource })
    if (!permissions.read) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    if (markAsViewed) {
      this.resourceViewService
        .create({ resourceId: id, userId: req.user.id })
        .catch((error) => this.logger.error('Error while marking resource as viewed', error))
    }

    Object.assign(resource, { permissions })
    return new ItemResponse({ resource })
  }

  @Post()
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async create(@Req() req: IRequest, @Body() input: CreateResourceDTO): Promise<CreatedResponse<ResourceDTO>> {
    const parent = await this.resourceService.findByIdOrCode(input.parentId)
    if (!parent.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${input.parentId}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: parent.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${input.parentId}`)
    }

    const resource = Mapper.map(
      await this.resourceService.create({
        ...(await this.resourceService.fromInput(input)),
        ownerId: req.user.id,
      }),
      ResourceDTO
    )

    Object.assign(resource, { permissions })

    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async update(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body() input: UpdateResourceDTO
  ): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const resource = Mapper.map(
      await this.resourceService.update(existing.get(), await this.resourceService.fromInput(input)),
      ResourceDTO
    )

    Object.assign(resource, { permissions })

    return new ItemResponse({ resource })
  }

  @Patch('/:id/move')
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async move(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body('parentId') parentId: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const parentCircle = await this.resourceService.findByIdOrCode(existing.get().parentId!)

    if (req.user.role !== 'admin' && !parentCircle.get().personal) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource (permissions): ${id}`)
    }

    const circlePermissions = await this.permissionService.userPermissionsOnResource({
      req,
      resource: parentCircle.get(),
    })
    if (!circlePermissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource (circle permissions): ${id}`)
    }

    const resource = Mapper.map(await this.resourceService.move(id, parentId), ResourceDTO)

    return new ItemResponse({ resource })
  }

  @Patch('/:id/movetoowner')
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async moveToOwnerCircle(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body('ownerId') ownerId: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    if (existing.get().type === 'CIRCLE') {
      throw new ForbiddenResponse(`Operation not allowed on circles`)
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const user = await this.userService.findById(ownerId)
    if (!user.isPresent()) {
      throw new NotFoundResponse(`User not found: ${ownerId}`)
    }
    const circle = await this.resourceService.getPersonal(user.get())

    const resource = Mapper.map(await this.resourceService.move(id, circle.id), ResourceDTO)

    const originalCircle = await this.resourceService.findByIdOrCode(existing.get().parentId!)

    this.notificationService
      .sendToUser<ResourceMovedByAdminNotification>(ownerId, {
        type: 'RESOURCE-MOVED-BY-ADMIN',
        resourceId: id,
        resourceName: resource.name,
        circleId: originalCircle.get().id,
        circleName: originalCircle.get().name,
      })
      .catch((error) => {
        this.logger.error('Failed to send notification', error)
      })

    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async delete(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<void> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const parentCircle = await this.resourceService.findByIdOrCode(existing.get().parentId!)

    if (!parentCircle.get().personal) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    await this.fileService.repo(existing.get().id).then((repo) => repo.repo.removeRepo())

    await this.resourceService.delete(existing.get())
  }
}
