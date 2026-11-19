import { Expandable, Selectable } from '@cisstech/nestjs-expand'
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  BadRequestResponse,
  CreatedResponse,
  DEFAULT_USER_ID,
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NotFoundResponse,
  User,
  UserRoles,
} from '@platon/core/common'
import { IRequest, Mapper, Public, Roles, UserDTO, UserService, UUIDParam } from '@platon/core/server'
import { ACTIVITY_MAIN_FILE, EXERCISE_MAIN_FILE, TEMPLATE_OVERRIDE_FILE } from '@platon/feature/compiler'
import { ResourceMovedByAdminNotification } from '@platon/feature/course/common'
import { NotificationService } from '@platon/feature/notification/server'
import { LATEST, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceCompletionDTO } from './completion'
import { ResourceFileService } from './files'
import { ResourcePermissionService } from './permissions/permissions.service'
import {
  CircleTreeDTO,
  CreatePreviewResourceDTO,
  CreateResourceDTO,
  ResourceDTO,
  ResourceFiltersDTO,
  UpdateResourceDTO,
} from './resource.dto'
import { ResourceService } from './resource.service'
import { ResourceViewService } from './views/view.service'
import { ResourceDependencyService } from './dependency'

@ApiBearerAuth()
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
    private readonly fileService: ResourceFileService,
    private readonly dependencyService: ResourceDependencyService
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
        response[0].map((view) => ({ ...view.resource, viewedAt: view.updatedAt })),
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
    return new ListResponse({ resources: Mapper.mapAll(owners, UserDTO), total: owners.length })
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

    const { files, ...props } = input
    if (files?.length) {
      switch (props.type) {
        case ResourceTypes.EXERCISE:
          if (!files.some((f) => f.path === EXERCISE_MAIN_FILE)) {
            throw new BadRequestResponse(`No ${EXERCISE_MAIN_FILE} file found`)
          }
          break
        case ResourceTypes.ACTIVITY:
          if (!files.some((f) => f.path === ACTIVITY_MAIN_FILE)) {
            throw new BadRequestResponse(`No ${ACTIVITY_MAIN_FILE} file found`)
          }
          break
      }
    }

    const resource = Mapper.map(
      await this.resourceService.create({
        ...(await this.resourceService.fromInput(props)),
        ownerId: req.user.id,
      }),
      ResourceDTO
    )

    Object.assign(resource, { permissions })

    if (files?.length) {
      await this.fileService.repo(
        resource.id,
        req,
        files.reduce((acc, f) => ({ ...acc, [f.path]: f.content }), {})
      )
    }

    return new CreatedResponse({ resource })
  }

  @Post('/:id/duplicate')
  @Roles(UserRoles.admin, UserRoles.teacher)
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async duplicateResource(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<CreatedResponse<ResourceDTO>> {
    const existing = (await this.resourceService.findByIdOrCode(id)).orElseThrow(
      () => new NotFoundResponse(`Resource not found: ${id}`)
    )
    if (![ResourceTypes.EXERCISE, ResourceTypes.ACTIVITY].includes(existing.type)) {
      throw new BadRequestResponse(`Only exercises and activities can be duplicated: ${id}`)
    }
    // All teachers and admins can duplicate resources that they have read access to
    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing })
    if (!permissions.read) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const userCircle = await this.resourceService.getPersonal(req.user)
    // Create the duplicated resource
    let duplicatedResourceEntity
    try {
      duplicatedResourceEntity = await this.resourceService.create({
        ...existing,
        id: undefined,
        ownerId: req.user.id,
        parentId: userCircle.id,
        name: `${existing.name} (Copie)`,
        status: ResourceStatus.DRAFT,
      })
      await this.fileService.copy(existing.id, duplicatedResourceEntity.id, req)
    } catch (error) {
      // Cleanup the newly created resource if file copy fails
      if (duplicatedResourceEntity?.id) {
        try {
          await this.resourceService.delete(duplicatedResourceEntity)
        } catch (_) {
          // Ignore cleanup errors to avoid masking the original failure
        }
      }
      throw error
    }
    const resource = Mapper.map(duplicatedResourceEntity, ResourceDTO)

    // The user duplicating the resource is the owner of the new resource
    const newPermissions = await this.permissionService.userPermissionsOnResource({ req, resource })
    Object.assign(resource, { permissions: newPermissions })
    return new CreatedResponse({ resource })
  }

  @Public()
  @Post('/preview')
  @Expandable(ResourceDTO, { rootField: 'resource' })
  @Selectable({ rootField: 'resource' })
  async createPreview(
    @Req() req: IRequest,
    @Body() input: CreatePreviewResourceDTO
  ): Promise<CreatedResponse<ResourceDTO>> {
    if (!input.files.some((f) => f.path === EXERCISE_MAIN_FILE)) {
      throw new BadRequestResponse(`No ${EXERCISE_MAIN_FILE} file found`)
    }

    const user = (await this.userService.findById(DEFAULT_USER_ID)).orElseThrow(
      () => new InternalServerErrorException(`Default user not found: ${DEFAULT_USER_ID}: should never happen`)
    )
    const circle = await this.resourceService.getPersonal(user)

    const resource = input.resourceId
      ? Mapper.map(await this.resourceService.getById(input.resourceId), ResourceDTO)
      : Mapper.map(
          await this.resourceService.create({
            ownerId: DEFAULT_USER_ID,
            name: `Preview: ${new Date().toISOString()}`,
            publicPreview: true,
            status: ResourceStatus.DRAFT,
            type: ResourceTypes.EXERCISE,
            personal: true,
            parentId: circle.id,
          }),
          ResourceDTO
        )

    const { repo } = await this.fileService.repo(
      resource.id,
      req,
      input.files.reduce((acc, f) => ({ ...acc, [f.path]: f.content }), {})
    )

    if (input.resourceId) {
      await Promise.all(input.files.map((f) => repo.write(f.path, f.content || '')))
    }

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

  @Get('/:id/configurable-exercise')
  async isConfigurableExercise(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<ItemResponse<boolean>> {
    const resource = await this.resourceService.findByIdOrCode(id)
    if (!resource.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: resource.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    return new ItemResponse({ resource: await this.resourceService.isConfigurableExercise(id) })
  }

  @Patch('/:id/template')
  async updateTemplate(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body('templateId') templateId: string,
    @Body('templateVersion') templateVersion: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const wasNotTemplate = !existing.get().templateId

    const resource = Mapper.map(
      await this.resourceService.update(existing.get(), {
        templateId,
        templateVersion,
      }),
      ResourceDTO
    )

    await this.dependencyService.updateTemplateDependency({
      resourceId: id,
      resourceVersion: LATEST,
      dependOnId: templateId,
      dependOnVersion: templateVersion,
      isTemplate: true,
    })

    if (wasNotTemplate) {
      try {
        const { repo } = await this.fileService.repo(existing.get(), req)

        const ploExists = await repo.exists(TEMPLATE_OVERRIDE_FILE)
        if (!ploExists) {
          await repo.touch(TEMPLATE_OVERRIDE_FILE, '{}')
        }
      } catch (error) {
        console.error(`Failed to create PLO file for resource ${id}:`, error)
      }
    }

    return new ItemResponse({ resource })
  }

  @Delete('/:id/template')
  async removeTemplate(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const resource = Mapper.map(await this.resourceService.deleteTemplate(id), ResourceDTO)

    await this.dependencyService.deleteDependencyForVersion(id, LATEST)

    return new ItemResponse({ resource })
  }

  @Patch('/:id/certification')
  async updateCertification(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body('certified') certified: boolean
  ): Promise<ItemResponse<ResourceDTO>> {
    const existing = await this.resourceService.findByIdOrCode(id)
    if (!existing.isPresent()) {
      throw new NotFoundResponse(`Resource not found: ${id}`)
    }

    if (existing.get().type !== ResourceTypes.EXERCISE) {
      throw new BadRequestResponse(`Resource is not an exercise: ${id}`)
    }

    const permissions = await this.permissionService.userPermissionsOnResource({ req, resource: existing.get() })
    if (!permissions.write) {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenResponse(`Operation not allowed on resource: ${id}`)
    }

    const resource = Mapper.map(await this.resourceService.updateCertification(id, certified), ResourceDTO)

    return new ItemResponse({ resource })
  }
}
