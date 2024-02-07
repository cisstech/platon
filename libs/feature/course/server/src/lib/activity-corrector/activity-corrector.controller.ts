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
import { IRequest, Mapper, Roles } from '@platon/core/server'
import { ActivityCorrectorDTO, CreateActivityCorrectorDTO } from './activity-corrector.dto'
import { ActivityCorrectorService } from './activity-corrector.service'
import { ActivityService } from '../activity/activity.service'

@Controller('activities/:activityId/correctors')
@ApiTags('Courses')
export class ActivityCorrectorController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly activityCorrectorService: ActivityCorrectorService
  ) {}

  @Get()
  async search(@Param('activityId') activityId: string): Promise<ListResponse<ActivityCorrectorDTO>> {
    const [items, total] = await this.activityCorrectorService.search(activityId)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityCorrectorDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    const member = await this.activityCorrectorService.create(input)
    return new ItemResponse({
      resource: Mapper.map(
        (await this.activityCorrectorService.findById(activityId, member.id)).get(),
        ActivityCorrectorDTO
      ),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put()
  async update(
    @Req() req: IRequest,
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO[]
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    await this.activityCorrectorService.update(activityId, input)
    return new ItemResponse({
      resource: Mapper.map(await this.activityCorrectorService.search(activityId), ActivityCorrectorDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:activityCorrectorId')
  async delete(
    @Req() req: IRequest,
    @Param('activityId') activityId: string,
    @Param('activityCorrectorId') activityCorrectorId: string
  ): Promise<NoContentResponse> {
    await this.activityService.withActivity(activityId, (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (activity.creatorId !== req.user.id) {
        throw new ForbiddenResponse('You are not the creator of this activity')
      }
    })

    await this.activityCorrectorService.delete(activityId, activityCorrectorId)
    return new NoContentResponse()
  }
}
