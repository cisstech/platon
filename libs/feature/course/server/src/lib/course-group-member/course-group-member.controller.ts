import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CourseGroupService } from '../course-group/course-group.service'
import { CourseMemberDTO } from '../course-member/course-member.dto'
import { CourseMemberService } from '../course-member/course-member.service'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseGroupMemberEntity } from './course-group-member.entity'
import { CourseGroupMemberService } from './course-group-member.service'

/**
 * The members of the groups of a course: read by its members, written by who may change the course,
 * in a group of that course only, and shown as the course shows its members.
 */
@ApiBearerAuth()
@Controller('courseGroupMembers/:courseId/')
@ApiTags('CourseGroupMembers')
export class CourseGroupMemberController {
  constructor(
    private readonly courseGroupMemberService: CourseGroupMemberService,
    private readonly courseMemberService: CourseMemberService,
    private readonly courseGroupService: CourseGroupService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  @Get(':groupId')
  async list(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string
  ): Promise<ListResponse<CourseMemberDTO>> {
    await this.permissionsService.ensureGroupReadPermission(courseId, groupId, req)
    return this.membersOf(courseId, await this.courseGroupMemberService.listCourseGroupMembers(groupId))
  }

  /** The members of several groups of the course; a group of another course adds no one. */
  @Post()
  async listGroupsMembers(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body('groupsIds') groupsIds: string[]
  ): Promise<ListResponse<CourseMemberDTO>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
    const groups = new Set((await this.courseGroupService.listCourseGroups(courseId)).map((group) => group.groupId))
    const ofCourse = (Array.isArray(groupsIds) ? groupsIds : []).filter((groupId) => groups.has(groupId))
    return this.membersOf(courseId, await this.courseGroupMemberService.listGroupsMembers(ofCourse))
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete(':groupId/:userId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string,
    @UUIDParam('userId') userId: string
  ): Promise<NoContentResponse> {
    await this.permissionsService.ensureGroupWritePermission(courseId, groupId, req)
    if (!(await this.courseGroupMemberService.isMember(groupId, userId))) {
      throw new ForbiddenResponse('You are not a member of this group')
    }

    await this.courseGroupMemberService.deleteMember(groupId, userId)
    return new NoContentResponse()
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post(':groupId/:userId')
  async create(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Param('groupId') groupId: string,
    @UUIDParam('userId') userId: string
  ): Promise<NoContentResponse> {
    await this.permissionsService.ensureGroupWritePermission(courseId, groupId, req)
    if (await this.courseGroupMemberService.isMember(groupId, userId)) {
      throw new ForbiddenResponse('User is already a member of this group')
    }

    await this.courseGroupMemberService.addCourseGroupMember(groupId, userId)
    return new NoContentResponse()
  }

  /** The members of the course among `items`, as their DTO: never more of a person than the course shows. */
  private async membersOf(courseId: string, items: CourseGroupMemberEntity[]): Promise<ListResponse<CourseMemberDTO>> {
    const [members] = await this.courseMemberService.search(courseId)
    const resources = members.flatMap((member) => {
      const item = items.find((candidate) => candidate.userId === member.userId)
      return item ? [{ ...member, createdAt: item.createdAt, updatedAt: item.updatedAt }] : []
    })
    return new ListResponse({ total: resources.length, resources: Mapper.mapAll(resources, CourseMemberDTO) })
  }
}
