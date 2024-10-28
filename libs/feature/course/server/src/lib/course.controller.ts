import { Expandable } from '@cisstech/nestjs-expand'
import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  CreatedResponse,
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CourseDTO, CourseFiltersDTO, CreateCourseDTO, UpdateCourseDTO } from './course.dto'
import { CourseService } from './course.service'
import { CoursePermissionsService } from './permissions/permissions.service'
import { CourseMemberService } from './course-member/course-member.service'

@Controller('courses')
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly permissionsService: CoursePermissionsService,
    private readonly courseMemberService: CourseMemberService
  ) {}

  @Get()
  @Expandable(CourseDTO, { rootField: 'resources' })
  async search(@Req() req: IRequest, @Query() filters: CourseFiltersDTO = {}): Promise<ListResponse<CourseDTO>> {
    filters = {
      ...filters,
      members: Array.from(new Set([req.user.id, ...(filters.members || [])])),
      showAll: filters.showAll == true && req.user.role == UserRoles.admin,
    }

    const [items, total] = await this.courseService.search(filters)
    const resources = Mapper.mapAll(items, CourseDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:id')
  @Expandable(CourseDTO, { rootField: 'resource' })
  async find(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<ItemResponse<CourseDTO>> {
    const optional = await this.courseService.findById(id)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Course not found: ${id}`)),
      CourseDTO
    )

    await this.permissionsService.ensureCourseReadPermission(id, req)

    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  @Expandable(CourseDTO, { rootField: 'resource' })
  async create(@Req() req: IRequest, @Body() input: CreateCourseDTO): Promise<CreatedResponse<CourseDTO>> {
    const resource = Mapper.map(
      await this.courseService.create({
        ...input,
        ownerId: req.user.id,
      }),
      CourseDTO
    )
    return new CreatedResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:id')
  @Expandable(CourseDTO, { rootField: 'resource' })
  async update(
    @Req() req: IRequest,
    @UUIDParam('id') id: string,
    @Body() input: UpdateCourseDTO
  ): Promise<ItemResponse<CourseDTO>> {
    if (!(await this.courseMemberService.isMember(id, req.user.id))) {
      throw new ForbiddenResponse(`You are not a member of this course`)
    }
    const resource = Mapper.map(
      await this.courseService.update(id, input, (course) =>
        this.permissionsService.ensureCourseWritePermission(course.id, req)
      ),
      CourseDTO
    )
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:id')
  async delete(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<void> {
    await this.permissionsService.ensureCourseWritePermission(id, req)
    await this.courseService.delete(id)
  }
}
