import { Controller, Get, Param, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, ListResponse } from '@platon/core/common'
import { IRequest, Mapper, toNumber } from '@platon/core/server'
import { ActivityMemberService, CourseMemberService, ActivityGroupService } from '@platon/feature/course/server'
import { ActivityLeaderboardEntryDTO, CourseLeaderboardEntryDTO } from './leaderboard.dto'
import { LeaderboardService } from './leaderboard.service'

@Controller('results/leaderboard')
@ApiTags('Results')
export class LeaderboardController {
  constructor(
    private readonly service: LeaderboardService,
    private readonly courseMemberService: CourseMemberService,
    private readonly activityMemberService: ActivityMemberService,
    private readonly activityGroupService: ActivityGroupService
  ) {}

  @Get('courses/:id')
  async ofCourse(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Query('limit', { transform: (value: string) => toNumber(value) }) limit?: number
  ): Promise<ListResponse<CourseLeaderboardEntryDTO>> {
    const isMember = this.courseMemberService.isMember(id, req.user.id)
    if (!isMember) {
      throw new ForbiddenResponse('You are not a member of this course')
    }

    const entries = await this.service.ofCourse(id, limit)

    return new ListResponse({
      resources: Mapper.mapAll(entries, CourseLeaderboardEntryDTO),
      total: entries.length,
    })
  }

  @Get('activities/:id')
  async ofActivity(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Query('limit', { transform: (value: string) => toNumber(value) })
    limit?: number
  ): Promise<ListResponse<ActivityLeaderboardEntryDTO>> {
    const isPrivateMember = await this.activityMemberService.isPrivateMember(id, req.user.id)
    const isInGroup = await this.activityGroupService.isUserInActivityGroup(req.user.id, id)
    const isMember =
      (await this.activityMemberService.isMember(id, req.user.id)) &&
      (await this.activityGroupService.numberOfGroups(id)) === 0
    if (!isPrivateMember && !isInGroup && !isMember) {
      throw new ForbiddenResponse('You are not a member of this activity')
    }

    const entries = await this.service.ofActivity(id, limit)
    return new ListResponse({
      resources: Mapper.mapAll(entries, ActivityLeaderboardEntryDTO),
      total: entries.length,
    })
  }
}
