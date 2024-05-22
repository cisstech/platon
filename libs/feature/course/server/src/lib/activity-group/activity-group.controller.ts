import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ActivityGroupService } from './activity-group.service'
import { ActivityService } from '../activity/activity.service'
import { CourseGroupService } from '../course-group/course-group.service'
import { Roles } from '@platon/core/server'
import { ListResponse, NotFoundResponse, UserRoles } from '@platon/core/common'
import { ActivityGroupEntity } from './activity-group.entity'

@Controller('activities/:activityId/groups')
@ApiTags('Courses')
export class ActivityGroupController {
  constructor(
    private readonly activityGroupService: ActivityGroupService,
    private readonly activityService: ActivityService,
    private readonly courseGroupService: CourseGroupService
  ) {}

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(@Param('activityId') activityId: string, @Body() groupId: string): Promise<void> {
    await this.activityService.withActivity(activityId, async (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      const group = await this.courseGroupService.findById(groupId)
      if (!group) {
        throw new NotFoundResponse(`Group ${groupId} not found.`)
      }

      await this.activityGroupService.create(activityId, groupId)
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete(':groupId')
  async delete(@Param('activityId') activityId: string, @Param('groupId') groupId: string): Promise<void> {
    await this.activityGroupService.delete(activityId, groupId)
  }

  @Get()
  async search(@Param('activityId') activityId: string): Promise<ListResponse<ActivityGroupEntity>> {
    const items = await this.activityGroupService.search(activityId)
    return new ListResponse({ resources: items, total: items.length })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put()
  async update(@Param('activityId') activityId: string, @Body() groupsIds: string[]): Promise<ActivityGroupEntity[]> {
    return this.activityGroupService.update(activityId, groupsIds)
  }
}
