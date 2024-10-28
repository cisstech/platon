import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CourseGroupMemberService } from './course-group-member.service'
import { ForbiddenResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { CourseMemberDTO } from '../course-member/course-member.dto'
import { CourseMemberService } from '../course-member/course-member.service'
import { IRequest, Roles, UUIDParam } from '@platon/core/server'

@Controller('courseGroupMembers/:courseId/')
@ApiTags('CourseGroupMembers')
export class CourseGroupMemberController {
  constructor(
    private readonly courseGroupMemberService: CourseGroupMemberService,
    private readonly courseMemberService: CourseMemberService
  ) {}

  @Get(':groupId')
  async list(
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('groupId') groupId: string
  ): Promise<ListResponse<CourseMemberDTO>> {
    const items = await this.courseGroupMemberService.listCourseGroupMembers(groupId)
    const members = (await this.courseMemberService.search(courseId))[0]
    const resources = members
      .filter((member) => items.some((item) => item.userId === member.userId))
      .map((member) => {
        const item = items.find((item) => item.userId === member.userId)!
        return {
          ...member,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }
      })
    return new ListResponse({
      total: resources.length,
      resources: resources,
    })
  }

  @Post()
  async listGroupsMembers(
    @UUIDParam('courseId') courseId: string,
    @Body('groupsIds') groupsIds: string[]
  ): Promise<ListResponse<CourseMemberDTO>> {
    const items = await this.courseGroupMemberService.listGroupsMembers(groupsIds)
    const members = (await this.courseMemberService.search(courseId))[0]
    const resources = members
      .filter((member) => items.some((item) => item.userId === member.userId))
      .map((member) => {
        const item = items.find((item) => item.userId === member.userId)!
        return {
          ...member,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }
      })
    return new ListResponse({
      total: resources.length,
      resources: resources,
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete(':groupId/:userId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('groupId') groupId: string,
    @UUIDParam('userId') userId: string
  ): Promise<NoContentResponse> {
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
    @UUIDParam('groupId') groupId: string,
    @UUIDParam('userId') userId: string
  ): Promise<NoContentResponse> {
    if (await this.courseGroupMemberService.isMember(groupId, userId)) {
      throw new ForbiddenResponse('User is already a member of this group')
    }

    await this.courseGroupMemberService.addCourseGroupMember(groupId, userId)
    return new NoContentResponse()
  }
}
