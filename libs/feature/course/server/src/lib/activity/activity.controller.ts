import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse, NotFoundResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { CourseActivityDTO, CreateCourseActivityDTO, UpdateCourseActivityDTO } from './activity.dto';
import { CourseActivityService } from './activity.service';

@Controller('courses/:courseId/activities')
export class CourseActivityController {
  constructor(
    private readonly service: CourseActivityService
  ) { }

  @Get()
  async list(
    @Param('courseId') courseId: string
  ): Promise<ListResponse<CourseActivityDTO>> {
    const [items, total] = await this.service.ofCourse(courseId);
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseActivityDTO)
    });
  }

  @Get('/:activityId')
  async find(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
  ): Promise<ItemResponse<CourseActivityDTO>> {
    const optional = await this.service.findById(courseId, activityId);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`CourseActivity not found: ${activityId}`)),
      CourseActivityDTO
    );

    return new ItemResponse({ resource })
  }


  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseActivityDTO,
  ): Promise<ItemResponse<CourseActivityDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.create({
          ...await this.service.fromInput(input),
          courseId
        }),
        CourseActivityDTO
      )
    });
  }

  @Patch('/:activityId')
  async update(
    @Param('courseId') courseId: string,
    @Param('activityId') activityId: string,
    @Body() input: UpdateCourseActivityDTO,
  ): Promise<ItemResponse<CourseActivityDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.update(courseId, activityId, {
          ...await this.service.fromInput(input),
          courseId
        }),
        CourseActivityDTO
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
