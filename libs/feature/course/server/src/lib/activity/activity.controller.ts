import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse, NotFoundResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ActivityDTO, ActivityFiltersDTO, CreateCourseActivityDTO, UpdateCourseActivityDTO } from './activity.dto';
import { ActivityService } from './activity.service';

@Controller('courses/:courseId/activities')
export class ActivityController {
  constructor(
    private readonly service: ActivityService
  ) { }

  @Get()
  async list(
    @Req() req: IRequest,
    @Param('courseId') courseId: string,
    @Query() filters?: ActivityFiltersDTO,
  ): Promise<ListResponse<ActivityDTO>> {
    const [items, total] = await this.service.ofCourse(courseId, req.user, filters);
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityDTO)
    });
  }

  @Get('/:activityId')
  async find(
    @Req() req: IRequest,
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
  ): Promise<ItemResponse<ActivityDTO>> {
    const optional = await this.service.findById(courseId, activityId, req.user);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`CourseActivity not found: ${activityId}`)),
      ActivityDTO
    );

    return new ItemResponse({ resource })
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseActivityDTO,
  ): Promise<ItemResponse<ActivityDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.create({
          ...await this.service.fromInput(input),
          courseId
        }),
        ActivityDTO
      )
    });
  }

  @Patch('/:activityId')
  async update(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
    @Body() input: UpdateCourseActivityDTO,
  ): Promise<ItemResponse<ActivityDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.update(courseId, activityId, {
          ...await this.service.fromInput(input),
          courseId
        }),
        ActivityDTO
      )
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
