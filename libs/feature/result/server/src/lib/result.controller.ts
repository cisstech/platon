import { Controller, Get, Param } from '@nestjs/common'
import { ActivityResults, UserResults } from '@platon/feature/result/common'
import { ResultService } from './result.service'
import { Roles } from '@platon/core/server'
import { UserRoles } from '@platon/core/common'

@Controller('results')
export class ResultController {
  constructor(private readonly service: ResultService) {}

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Get('/activity/:activityId')
  activityResults(@Param('activityId') activityId: string): Promise<ActivityResults> {
    return this.service.activityResults(activityId)
  }

  @Get('/session/:sessionId')
  async sessionResults(@Param('sessionId') sessionId: string): Promise<UserResults> {
    return (await this.service.sessionResults(sessionId)).users[0]
  }
}
