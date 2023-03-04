import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { CourseSectionDTO, CreateCourseSectionDTO, UpdateCourseSectionDTO } from './section.dto';
import { CourseSectionEntity } from './section.entity';
import { CourseSectionService } from './section.service';

@Controller('courses/:courseId/sections')
export class CourseSectionController {
  constructor(
    private readonly service: CourseSectionService
  ) { }

  @Get()
  async list(
    @Param('courseId') courseId: string
  ): Promise<ListResponse<CourseSectionDTO>> {
    const [items, total] = await this.service.ofCourse(courseId);
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseSectionDTO)
    });
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseSectionDTO,
  ): Promise<ItemResponse<CourseSectionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.create({
          ...input,
          courseId,
        } as CourseSectionEntity),
        CourseSectionDTO
      )
    });
  }

  @Patch('/:sectionId')
  async update(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() input: UpdateCourseSectionDTO,
  ): Promise<ItemResponse<CourseSectionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.update(courseId, sectionId, input),
        CourseSectionDTO
      )
    });
  }

  @Delete('/:sectionId')
  async delete(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(courseId, sectionId);
    return new NoContentResponse();
  }
}
