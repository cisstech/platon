import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NoContentResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common'
import { AuthService, IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import {
  ArchiveCourseMemberDTO,
  CourseMemberDTO,
  CourseMemberFiltersDTO,
  CreateCourseMemberDTO,
  UpdateCourseMemberRoleDTO,
} from './course-member.dto'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseMemberService } from './course-member.service'
import { CourseMemberRoles, CreateTestMember } from '@platon/feature/course/common'

@ApiBearerAuth()
@Controller('courses/:courseId/members')
@ApiTags('Courses')
export class CourseMemberController {
  constructor(
    private readonly courseMemberService: CourseMemberService,
    private readonly authService: AuthService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  /** The members of a course, read by its members only: they come with their email. */
  @Get()
  async search(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Query() filters: CourseMemberFiltersDTO = {}
  ): Promise<ListResponse<CourseMemberDTO>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
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
      ? await this.courseMemberService.addGroup(courseId, input.id, { notify: true, role: input.role })
      : await this.courseMemberService.addUser(courseId, input.id, input.role)

    return new ItemResponse({
      resource: Mapper.map((await this.courseMemberService.findById(courseId, member.id)).get(), CourseMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post('test')
  async createTestMembers(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: CreateTestMember[]
  ): Promise<ListResponse<CourseMemberDTO>> {
    if (!(await this.courseMemberService.hasWritePermission(courseId, req.user))) {
      throw new ForbiddenResponse('You are not allowed to add members to this course')
    }

    const existingMembersSet = new Set(
      (
        await this.courseMemberService.search(courseId, {
          roles: [CourseMemberRoles.student],
        })
      )[0].map(
        (e) =>
          `${e.user?.firstName?.toLowerCase() ?? ''}|${e.user?.lastName?.toLowerCase() ?? ''}|${
            e.user?.email?.toLowerCase() ?? ''
          }`
      )
    )

    const addedMemberIds: string[] = []

    for (const member of input) {
      const key = `${member.firstName?.toLowerCase() ?? ''}|${member.lastName?.toLowerCase() ?? ''}|${
        member.email?.toLowerCase() ?? ''
      }`
      if (existingMembersSet.has(key)) {
        continue
      } else {
        const id = await this.authService.createCandidateAccount(member)
        const newMember = await this.courseMemberService.addUser(courseId, id, CourseMemberRoles.student, false)
        addedMemberIds.push(newMember.id)
        existingMembersSet.add(key)
      }
    }

    const addedMembers =
      addedMemberIds.length > 0 ? await this.courseMemberService.findByIds(courseId, addedMemberIds) : []

    return new ListResponse({
      total: addedMembers.length,
      resources: Mapper.mapAll(addedMembers, CourseMemberDTO),
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

  @Patch('/me')
  async archiveMyMembership(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: ArchiveCourseMemberDTO
  ): Promise<ItemResponse<CourseMemberDTO>> {
    await this.courseMemberService.setArchivedByUser(courseId, req.user.id, input.archived)
    const member = (await this.courseMemberService.getByUserIdAndCourseId(req.user.id, courseId)).orElseThrow(
      () => new NotFoundResponse('Member not found')
    )
    return new ItemResponse({
      resource: Mapper.map(member, CourseMemberDTO),
    })
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
