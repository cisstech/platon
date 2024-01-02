import { Controller, Get, Param, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, UserRoles } from '@platon/core/common'
import { IRequest, Roles } from '@platon/core/server'
import {
  ACTIVITY_EXERCISE_RESULTS,
  ACTIVITY_USER_RESULTS,
  ActivityResults,
  UserResults,
} from '@platon/feature/result/common'
import { DashboardService } from './dashboard/dashboard.service'

@Controller('results')
@ApiTags('Results')
export class ResultController {
  constructor(private readonly service: DashboardService) {}

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Get('/activity/:activityId')
  async activityResults(@Param('activityId') activityId: string): Promise<ActivityResults> {
    const output = await this.service.ofActivity(activityId)
    return {
      users: output[ACTIVITY_USER_RESULTS] as ActivityResults['users'],
      exercises: output[ACTIVITY_EXERCISE_RESULTS] as ActivityResults['exercises'],
    }
  }

  @Get('/session/:sessionId')
  async sessionResults(@Req() req: IRequest, @Param('sessionId') sessionId: string): Promise<UserResults> {
    const [session, output] = await this.service.ofSession(sessionId)
    if (session.userId && req.user?.id !== session.userId) {
      throw new ForbiddenResponse(`You don't have access to this session`)
    }
    const results = output[ACTIVITY_USER_RESULTS] as UserResults[]
    return results[0]
  }
}