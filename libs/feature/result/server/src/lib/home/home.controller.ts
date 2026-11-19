import { Controller, Get, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ListResponse } from '@platon/core/common'
import { IRequest, Mapper } from '@platon/core/server'
import { CourseMemberService } from '@platon/feature/course/server'
import { HomeActivitiesFilterDTO, PlayableActivityDTO, RecentCopyDTO, TaughtActivityDTO } from './home.dto'
import { HomeService } from './home.service'

/**
 * What the homes show of the requesting person, whatever their role: only their own data. With
 * `course`, the activities of that course, as its page shows them.
 */
@ApiBearerAuth()
@Controller()
@ApiTags('Results')
export class HomeController {
  constructor(private readonly service: HomeService, private readonly courseMembers: CourseMemberService) {}

  @Get('activities/mine')
  async playableActivities(
    @Req() req: IRequest,
    @Query() filter: HomeActivitiesFilterDTO
  ): Promise<ListResponse<PlayableActivityDTO>> {
    const activities = await this.service.playableActivities(req.user.id, filter.course)
    const resources = Mapper.mapAll(activities, PlayableActivityDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Get('activities/taught')
  async taughtActivities(
    @Req() req: IRequest,
    @Query() filter: HomeActivitiesFilterDTO
  ): Promise<ListResponse<TaughtActivityDTO>> {
    // Who may change a course reads all of its activities, as its page does, even without teaching it.
    const manages = !!filter.course && (await this.courseMembers.hasWritePermission(filter.course, req.user))
    const activities = await this.service.taughtActivities(req.user.id, { courseId: filter.course, manages })
    const resources = Mapper.mapAll(activities, TaughtActivityDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Get('results/recent')
  async recentCopies(@Req() req: IRequest): Promise<ListResponse<RecentCopyDTO>> {
    const resources = Mapper.mapAll(await this.service.recentCopies(req.user.id), RecentCopyDTO)
    return new ListResponse({ total: resources.length, resources })
  }
}
