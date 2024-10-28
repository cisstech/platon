import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NoContentResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { ActivityService } from '../activity/activity.service'
import { ActivityMemberDTO, CreateActivityMemberDTO } from './activity-member.dto'
import { ActivityMemberService } from './activity-member.service'

@Controller('activities/:activityId/members')
@ApiTags('Courses')
export class ActivityMemberController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly activityMemberService: ActivityMemberService
  ) {}

  @Get()
  async search(@UUIDParam('activityId') activityId: string): Promise<ListResponse<ActivityMemberDTO>> {
    const [items, total] = await this.activityMemberService.search(activityId)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @UUIDParam('activityId') activityId: string,
    @Body() input: CreateActivityMemberDTO
  ): Promise<ItemResponse<ActivityMemberDTO>> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update members of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    const member = await this.activityMemberService.create(input)
    return new ItemResponse({
      resource: Mapper.map((await this.activityMemberService.findById(activityId, member.id)).get(), ActivityMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put()
  async update(
    @Req() req: IRequest,
    @UUIDParam('activityId') activityId: string,
    @Body() input: CreateActivityMemberDTO[]
  ): Promise<ItemResponse<ActivityMemberDTO>> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update members of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    await this.activityMemberService.update(activityId, input)
    return new ItemResponse({
      resource: Mapper.map(await this.activityMemberService.search(activityId), ActivityMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:activityMemberId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('activityId') activityId: string,
    @UUIDParam('activityMemberId') activityMemberId: string
  ): Promise<NoContentResponse> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update members of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    await this.activityMemberService.delete(activityId, activityMemberId)
    return new NoContentResponse()
  }
}
