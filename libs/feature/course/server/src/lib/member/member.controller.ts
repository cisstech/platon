import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { CourseMemberDTO, CourseMemberFiltersDTO, CreateCourseMemberDTO } from './member.dto';
import { CourseMemberService } from './member.service';

@Controller('courses/:courseId/members')
export class CourseMemberController {
  constructor(
    private readonly service: CourseMemberService
  ) { }

  @Get()
  async list(
    @Param('courseId') courseId: string,
    @Query() filters: CourseMemberFiltersDTO = {}
  ): Promise<ListResponse<CourseMemberDTO>> {
    const [items, total] = await this.service.search(courseId, filters);
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseMemberDTO)
    });
  }

  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseMemberDTO,
  ): Promise<ItemResponse<CourseMemberDTO>> {
    if (input.isGroup) {
      const members = await this.service.addGroup(courseId, input.id);
      return new ItemResponse({
        resource: Mapper.map(members[0], CourseMemberDTO)
      });
    } else {
      return new ItemResponse({
        resource: Mapper.map(await this.service.addUser(courseId, input.id), CourseMemberDTO)
      });
    }
  }

  @Delete('/:userId')
  async delete(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(courseId, userId);
    return new NoContentResponse();
  }
}
