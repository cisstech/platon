import { Body, Controller, Delete, Get, Patch, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, NoContentResponse, NotFoundResponse, UserRoles } from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseSectionDTO, CreateCourseSectionDTO, UpdateCourseSectionDTO } from './section.dto'
import { CourseSectionEntity } from './section.entity'
import { CourseSectionService } from './section.service'

/** The sections of a course: read by its members, written by who may change the course. */
@ApiBearerAuth()
@Controller('courses/:courseId/sections')
@ApiTags('Courses')
export class CourseSectionController {
  constructor(
    private readonly service: CourseSectionService,
    private readonly permissionsService: CoursePermissionsService
  ) {}

  @Get('/:sectionId')
  async find(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('sectionId') sectionId: string
  ): Promise<ItemResponse<CourseSectionDTO>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
    const optional = await this.service.findById(courseId, sectionId)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`CourseSection not found: ${sectionId}`)),
      CourseSectionDTO
    )
    return new ItemResponse({ resource })
  }

  @Get()
  async list(@Req() req: IRequest, @UUIDParam('courseId') courseId: string): Promise<ListResponse<CourseSectionDTO>> {
    await this.permissionsService.ensureCourseReadPermission(courseId, req)
    const [items, total] = await this.service.ofCourse(courseId)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, CourseSectionDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @Body() input: CreateCourseSectionDTO
  ): Promise<ItemResponse<CourseSectionDTO>> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.create({ name: input.name, order: input.order, courseId } as CourseSectionEntity),
        CourseSectionDTO
      ),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:sectionId')
  async update(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('sectionId') sectionId: string,
    @Body() input: UpdateCourseSectionDTO
  ): Promise<ItemResponse<CourseSectionDTO>> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    return new ItemResponse({
      resource: Mapper.map(await this.service.update(courseId, sectionId, input), CourseSectionDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:sectionId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('courseId') courseId: string,
    @UUIDParam('sectionId') sectionId: string
  ): Promise<NoContentResponse> {
    await this.permissionsService.ensureCourseWritePermission(courseId, req)
    await this.service.delete(courseId, sectionId)
    return new NoContentResponse()
  }
}
