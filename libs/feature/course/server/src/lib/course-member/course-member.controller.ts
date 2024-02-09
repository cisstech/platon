import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, ItemResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles } from '@platon/core/server'
import { CourseMemberDTO, CourseMemberFiltersDTO, CreateCourseMemberDTO } from './course-member.dto'
import { CourseMemberService } from './course-member.service'

@Controller('courses/:courseId/members')
@ApiTags('Courses')
export class CourseMemberController {
  constructor(private readonly courseMemberService: CourseMemberService) {}

  @Get()
  async search(
    @Param('courseId') courseId: string,
    @Query() filters: CourseMemberFiltersDTO = {}
  ): Promise<ListResponse<CourseMemberDTO>> {
    const [items, total] = await this.courseMemberService.search(courseId, filters)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @Param('courseId') courseId: string,
    @Body() input: CreateCourseMemberDTO
  ): Promise<ItemResponse<CourseMemberDTO>> {
    if (!(await this.courseMemberService.isMember(courseId, req.user.id))) {
      throw new ForbiddenResponse('You are not a member of this course')
    }

    const member = input.isGroup
      ? await this.courseMemberService.addGroup(courseId, input.id)
      : await this.courseMemberService.addUser(courseId, input.id)

    return new ItemResponse({
      resource: Mapper.map((await this.courseMemberService.findById(courseId, member.id)).get(), CourseMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:memberId')
  async delete(
    @Req() req: IRequest,
    @Param('courseId') courseId: string,
    @Param('memberId') memberId: string
  ): Promise<NoContentResponse> {
    if (!(await this.courseMemberService.isMember(courseId, req.user.id))) {
      throw new ForbiddenResponse('You are not a member of this course')
    }

    await this.courseMemberService.delete(courseId, memberId)
    return new NoContentResponse()
  }
}
