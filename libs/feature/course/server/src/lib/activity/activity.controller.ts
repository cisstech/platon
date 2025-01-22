import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, NoContentResponse, NotFoundResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CoursePermissionsService } from '../permissions/permissions.service'
import {
  ActivityDTO,
  ActivityFiltersDTO,
  CreateCourseActivityDTO,
  ReloadCourseActivityDTO,
  UpdateCourseActivityDTO,
} from './activity.dto'
import { ActivityService } from './activity.service'

@Controller('courses/:courseId/activities')
@ApiTags('Courses')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  @Get()
  async search(
    @UUIDParam('courseId') courseId: string,
    @Query() filters?: ActivityFiltersDTO
  ): Promise<ListResponse<ActivityDTO>> {
    const [items, total] = await this.activityService.search(courseId, filters)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityDTO),
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
    return new ItemResponse({ resource: Mapper.map(activity, ActivityDTO) })
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
  @Patch('/change-order')
  async changeOrder(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: string[]
  ): Promise<NoContentResponse> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    await this.activityService.updateActivitesOrder(input)
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
}
