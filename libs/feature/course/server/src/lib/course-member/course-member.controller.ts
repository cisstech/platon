import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, ItemResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import {
  CourseMemberDTO,
  CourseMemberFiltersDTO,
  CreateCourseMemberDTO,
  UpdateCourseMemberRoleDTO,
} from './course-member.dto'
import { CourseMemberService } from './course-member.service'

@Controller('courses/:courseId/members')
@ApiTags('Courses')
export class CourseMemberController {
  constructor(private readonly courseMemberService: CourseMemberService) {}

  @Get()
  async search(
    @UUIDParam('courseId') courseId: string,
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
    @UUIDParam('courseId') courseId: string,
    @Body() input: CreateCourseMemberDTO
  ): Promise<ItemResponse<CourseMemberDTO>> {
    if (!(await this.courseMemberService.hasWritePermission(courseId, req.user))) {
      throw new ForbiddenResponse('You are not allowed to add a member to this course')
    }

    const member = input.isGroup
      ? await this.courseMemberService.addGroup(courseId, input.id)
      : await this.courseMemberService.addUser(courseId, input.id, input.role)

    return new ItemResponse({
      resource: Mapper.map((await this.courseMemberService.findById(courseId, member.id)).get(), CourseMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:memberId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('memberId') memberId: string
  ): Promise<NoContentResponse> {
    if (!(await this.courseMemberService.hasWritePermission(courseId, req.user))) {
      throw new ForbiddenResponse('You are not allowed to remove this member')
    }

    await this.courseMemberService.delete(courseId, memberId)
    return new NoContentResponse()
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch()
  async updateRole(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: UpdateCourseMemberRoleDTO
  ): Promise<ItemResponse<CourseMemberDTO>> {
    if (!(await this.courseMemberService.hasWritePermission(courseId, req.user))) {
      throw new ForbiddenResponse('You are not allowed to update the role of this member')
    }
    await this.courseMemberService.updateRole(courseId, input.id, input.role)
    return new ItemResponse({
      resource: Mapper.map((await this.courseMemberService.findById(courseId, input.id)).get(), CourseMemberDTO),
    })
  }
}
