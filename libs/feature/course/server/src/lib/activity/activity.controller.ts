import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  ItemResponse,
  ListResponse,
  NoContentResponse,
  NotFoundResponse,
  UserRoles,
  isTeacherRole,
} from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CoursePermissionsService } from '../permissions/permissions.service'
import {
  ActivityDTO,
  ActivityFiltersDTO,
  CreateCourseActivityDTO,
  CreateCourseActivitiesBatchDTO,
  ReloadCourseActivityDTO,
  UpdateCourseActivityDTO,
} from './activity.dto'
import { ActivityService } from './activity.service'
import { RestrictionListDTO } from './activity-restriction.dto'

@ApiBearerAuth()
@Controller('courses/:courseId/activities')
@ApiTags('Courses')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  @Get()
  async search(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Query() filters?: ActivityFiltersDTO
  ): Promise<ListResponse<ActivityDTO>> {
    const [items, total] = await this.activityService.search(courseId, filters)
    const resources = Mapper.mapAll(items, ActivityDTO)
    this.hideCodeFromNonTeachers(resources, req)
    return new ListResponse({
      total,
      resources,
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Get('/colors')
  async getCourseColors(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string
  ): Promise<ItemResponse<number[]>> {
    const colors = await this.activityService.getCourseColors(courseId)
    return new ItemResponse({
      resource: colors,
    })
  }

  @Get('/:activityId')
  async find(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string
  ): Promise<ItemResponse<ActivityDTO>> {
    const optional = await this.activityService.findByCourseId(courseId, activityId)
    const activity = optional.orElseThrow(() => new NotFoundResponse(`CourseActivity not found: ${activityId}`))

    await this.permissionsService.ensureActivityReadPermission(activity, req)
    const resource = Mapper.map(activity, ActivityDTO)
    this.hideCodeFromNonTeachers([resource], req)
    return new ItemResponse({ resource })
  }

  // ensureActivityReadPermission autorise aussi les étudiants membres : le code de déblocage doit rester caché pour eux.
  private hideCodeFromNonTeachers(resources: ActivityDTO[], req: IRequest): void {
    if (isTeacherRole(req.user.role)) return
    resources.forEach((resource) => delete (resource as { code?: string }).code)
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: CreateCourseActivityDTO
  ): Promise<ItemResponse<ActivityDTO>> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    const activity = await this.activityService.create({
      ...(await this.activityService.fromInput(input)),
      courseId,
      creatorId: req.user.id,
    })
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post('/batch')
  async createActivities(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() body: CreateCourseActivitiesBatchDTO
  ): Promise<ListResponse<ActivityDTO>> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    const inputs = body.activities
    const activities = await this.activityService.createActivities(
      await Promise.all(
        inputs.map(async (input) => ({
          ...(await this.activityService.fromInput(input)),
          courseId,
          creatorId: req.user.id,
        }))
      )
    )
    return new ListResponse({
      total: activities.length,
      resources: Mapper.mapAll(activities, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/change-order')
  async changeOrder(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: string[]
  ): Promise<NoContentResponse> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    await this.activityService.updateActivitesOrder(courseId, input)
    return new NoContentResponse()
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:activityId')
  async update(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string,
    @Body() input: UpdateCourseActivityDTO
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.update(
      courseId,
      activityId,
      { ...(await this.activityService.fromInput(input)) },
      (activity) => this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put('/:activityId')
  async reload(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string,
    @Body() input: ReloadCourseActivityDTO
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.reload(courseId, activityId, input, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:activityId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string
  ): Promise<NoContentResponse> {
    await this.activityService.delete(courseId, activityId, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new NoContentResponse()
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post('/:activityId/close')
  async close(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.close(courseId, activityId, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post('/:activityId/reopen')
  async reopen(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.reopen(courseId, activityId, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post('/:activityId/regenerate-code')
  async regenerateCode(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.regenerateCode(courseId, activityId, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:activityId/restrictions')
  async updateRestrictions(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('activityId') activityId: string,
    @Body() restrictions: RestrictionListDTO[]
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.activityService.updateRestrictions(courseId, activityId, restrictions, (activity) =>
      this.permissionsService.ensureActivityWritePermission(activity, req)
    )
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO),
    })
  }
}
