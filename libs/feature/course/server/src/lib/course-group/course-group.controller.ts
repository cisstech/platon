import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CourseGroupMemberService } from '../course-group-member/course-group-member.service'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseGroupDTO, UpdateGroupDTO } from './course-group.dto'
import { CourseGroupService } from './course-group.service'

/**
 * The groups of a course: read by its members, written by who may change the course, a group of
 * another course never.
 */
@ApiBearerAuth()
@Controller('courseGroups/:courseId/')
@ApiTags('CourseGroups')
export class CourseGroupController {
  constructor(
    private readonly courseGroupService: CourseGroupService,
    private readonly courseGroupMemberService: CourseGroupMemberService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  @Get()
  async list(@Req() req: IRequest, @UUIDParam('courseId') courseId: string): Promise<ListResponse<CourseGroupDTO>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
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
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string,
    @Body() input: UpdateGroupDTO
  ): Promise<ItemResponse<CourseGroupDTO>> {
    await this.permissionsService.ensureGroupWritePermission(courseId, groupId, req)
    const resource = Mapper.map(await this.courseGroupService.update(courseId, groupId, input), CourseGroupDTO)
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(@Req() req: IRequest, @UUIDParam('courseId') courseId: string): Promise<ItemResponse<CourseGroupDTO>> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    const resource = Mapper.map(await this.courseGroupService.addCourseGroup(courseId), CourseGroupDTO)
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:groupId/')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string
  ): Promise<void> {
    await this.permissionsService.ensureGroupWritePermission(courseId, groupId, req)
    await this.courseGroupMemberService.deleteAllMembersFromGroup(groupId)
    await this.courseGroupService.delete(courseId, groupId)
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Get('/:groupId/')
  async isMemberOfGroup(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string
  ): Promise<ItemResponse<boolean>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
    const isMember = await this.courseGroupService.isMember(groupId, req.user.id)
    return new ItemResponse({ resource: isMember })
  }
}
