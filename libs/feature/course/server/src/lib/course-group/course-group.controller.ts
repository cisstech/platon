import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CourseGroupService } from './course-group.service'
import { ItemResponse, ListResponse, UserRoles } from '@platon/core/common'
import { CourseGroupDTO, UpdateGroupDTO } from './course-group.dto'
import { IRequest, Mapper, Roles } from '@platon/core/server'

@Controller('courseGroups/:courseId/')
@ApiTags('CourseGroups')
export class CourseGroupController {
  constructor(private readonly courseGroupService: CourseGroupService) {}

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
}
