import { Body, Controller, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { CreatedResponse, ItemResponse, ListResponse, NotFoundResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { CourseDTO, CourseFiltersDTO, CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(
    private readonly service: CourseService,
  ) { }

  @Get()
  async search(
    @Request() req: IRequest,
    @Query() filters: CourseFiltersDTO = {}
  ): Promise<ListResponse<CourseDTO>> {
    filters = {
      ...filters,
      members: Array.from(
        new Set([
          req.user.id,
          ...(filters.members || [])
        ])
      )
    };

    const [items, total] = await this.service.search(filters);
    const resources = Mapper.mapAll(items, CourseDTO);
    return new ListResponse({ total, resources })
  }

  @Get('/:id')
  async find(
    @Request() req: IRequest,
    @Param('id') id: string,
  ): Promise<ItemResponse<CourseDTO>> {
    const optional = await this.service.findById(id);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Course not found: ${id}`)),
      CourseDTO
    );

    return new ItemResponse({ resource });
  }

  @Post()
  async create(
    @Request() req: IRequest,
    @Body() input: CreateCourseDTO
  ): Promise<CreatedResponse<CourseDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...input,
        ownerId: req.user.id
      }),
      CourseDTO
    );
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCourseDTO
  ): Promise<ItemResponse<CourseDTO>> {
    const resource = Mapper.map(
      await this.service.update(id, input),
      CourseDTO
    );
    return new ItemResponse({ resource })
  }
}
