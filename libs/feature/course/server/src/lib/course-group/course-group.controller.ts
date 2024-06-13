import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CourseGroupService } from './course-group.service'
import { ItemResponse, ListResponse, UserRoles } from '@platon/core/common'
import { CourseGroupDTO, UpdateGroupDTO } from './course-group.dto'
import { IRequest, Mapper, Roles } from '@platon/core/server'
import { CourseGroupMemberService } from '../course-group-member/course-group-member.service'

@Controller('courseGroups/:courseId/')
@ApiTags('CourseGroups')
export class CourseGroupController {
  constructor(
    private readonly courseGroupService: CourseGroupService,
    private readonly courseGroupMemberService: CourseGroupMemberService
  ) {}

  @Get()
  async list(@Param('courseId') courseId: string): Promise<ListResponse<CourseGroupDTO>> {
    const items = await this.courseGroupService.listCourseGroups(courseId)
    return new ListResponse({
      total: items.length,
      resources: items,
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:groupId/')
  async update(
    @Req() req: IRequest,
    @Param('groupId') groupId: string,
    @Body() input: UpdateGroupDTO
  ): Promise<ItemResponse<CourseGroupDTO>> {
    const resource = Mapper.map(await this.courseGroupService.update(groupId, input), CourseGroupDTO)
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(@Req() req: IRequest, @Param('courseId') courseId: string): Promise<ItemResponse<CourseGroupDTO>> {
    const resource = Mapper.map(await this.courseGroupService.addCourseGroup(courseId), CourseGroupDTO)
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:groupId/')
  async delete(@Req() req: IRequest, @Param('groupId') groupId: string): Promise<void> {
    await this.courseGroupMemberService.deleteAllMembersFromGroup(groupId)
    await this.courseGroupService.delete(groupId)
  }
}
