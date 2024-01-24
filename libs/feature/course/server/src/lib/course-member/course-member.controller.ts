import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { Mapper, Roles } from '@platon/core/server'
import { CourseMemberDTO, CourseMemberFiltersDTO, CreateCourseMemberDTO } from './course-member.dto'
import { CourseMemberService } from './course-member.service'

@Controller('courses/:courseId/members')
@ApiTags('Courses')
export class CourseMemberController {
  constructor(private readonly service: CourseMemberService) {}

  @Get()
  async search(
    @Param('courseId') courseId: string,
    @Query() filters: CourseMemberFiltersDTO = {}
  ): Promise<ListResponse<CourseMemberDTO>> {
    const [items, total] = await this.service.search(courseId, filters)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseMemberDTO),
    })
  }

  // TODO: check user membership for write operations

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseMemberDTO
  ): Promise<ItemResponse<CourseMemberDTO>> {
    const member = input.isGroup
      ? await this.service.addGroup(courseId, input.id)
      : await this.service.addUser(courseId, input.id)

    return new ItemResponse({
      resource: Mapper.map((await this.service.findById(courseId, member.id)).get(), CourseMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:memberId')
  async delete(@Param('courseId') courseId: string, @Param('memberId') memberId: string): Promise<NoContentResponse> {
    await this.service.delete(courseId, memberId)
    return new NoContentResponse()
  }
}
