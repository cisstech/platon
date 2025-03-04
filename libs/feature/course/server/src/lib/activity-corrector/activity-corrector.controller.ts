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
import { ActivityCorrectorDTO, CreateActivityCorrectorDTO } from './activity-corrector.dto'
import { ActivityCorrectorService } from './activity-corrector.service'
import { ActivityService } from '../activity/activity.service'
import { CourseMemberService } from '../course-member/course-member.service'

@Controller('activities/:activityId/correctors')
@ApiTags('Courses')
export class ActivityCorrectorController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly activityCorrectorService: ActivityCorrectorService,
    private readonly courseMemberService: CourseMemberService
  ) {}

  @Get()
  async search(@UUIDParam('activityId') activityId: string): Promise<ListResponse<ActivityCorrectorDTO>> {
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
    @UUIDParam('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    await this.activityService.withActivity(activityId, async (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (!(await this.courseMemberService.hasWritePermission(activity.courseId, req.user))) {
        throw new ForbiddenResponse('You cannot add correctors to this activity')
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
    @UUIDParam('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO[]
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    await this.activityService.withActivity(activityId, async (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (!(await this.courseMemberService.hasWritePermission(activity.courseId, req.user))) {
        throw new ForbiddenResponse('You cannot update correctors of this activity')
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
    @UUIDParam('activityId') activityId: string,
    @UUIDParam('activityCorrectorId') activityCorrectorId: string
  ): Promise<NoContentResponse> {
    await this.activityService.withActivity(activityId, async (activity) => {
      if (!activity) {
        throw new NotFoundResponse(`Activity ${activityId} not found.`)
      }

      if (activity.isChallenge) {
        throw new ForbiddenResponse('Cannot update correctors of a challenge')
      }

      if (!(await this.courseMemberService.hasWritePermission(activity.courseId, req.user))) {
        throw new ForbiddenResponse('You cannot delete remove of this activity')
      }
    })

    await this.activityCorrectorService.delete(activityId, activityCorrectorId)
    return new NoContentResponse()
  }
}
