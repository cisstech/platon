import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse, NotFoundResponse, UserRoles } from '@platon/core/common';
import { IRequest, Mapper, Roles } from '@platon/core/server';
import { ActivityDTO, ActivityFiltersDTO, CreateCourseActivityDTO, ReloadCourseActivityDTO, UpdateCourseActivityDTO } from './activity.dto';
import { ActivityService } from './activity.service';

@Controller('courses/:courseId/activities')
export class ActivityController {
  constructor(
    private readonly service: ActivityService
  ) { }

  @Get()
  async search(
    @Param('courseId') courseId: string,
    @Query() filters?: ActivityFiltersDTO,
  ): Promise<ListResponse<ActivityDTO>> {
    const [items, total] = await this.service.search(courseId, filters);
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityDTO)
    });
  }

  @Get('/:activityId')
  async find(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
  ): Promise<ItemResponse<ActivityDTO>> {
    const optional = await this.service.findByCourseIdAndId(courseId, activityId);
    const activity = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`CourseActivity not found: ${activityId}`)),
      ActivityDTO
    );
    return new ItemResponse({ resource: activity })
  }

  @Post()
  async create(
    @Req() req: IRequest,
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseActivityDTO,
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.service.create({
      ...await this.service.fromInput(input),
      courseId,
      creatorId: req.user.id
    })
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO)
    });
  }

  @Patch('/:activityId')
  async update(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
    @Body() input: UpdateCourseActivityDTO,
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.service.update(courseId, activityId, {
      ...await this.service.fromInput(input),
    });
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO)
    });
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put('/:activityId')
  async reload(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
    @Body() input: ReloadCourseActivityDTO,
  ): Promise<ItemResponse<ActivityDTO>> {
    const activity = await this.service.reload(courseId, activityId, input);
    return new ItemResponse({
      resource: Mapper.map(activity, ActivityDTO)
    });
  }

  @Delete('/:activityId')
  async delete(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(courseId, activityId);
    return new NoContentResponse();
  }
}
