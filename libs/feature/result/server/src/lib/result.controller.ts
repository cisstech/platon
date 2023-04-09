import { Controller, Get, Param } from '@nestjs/common';
import { ActivityResults, UserResults } from '@platon/feature/result/common';
import { ResultService } from './result.service';
import { Roles } from '@platon/core/server';
import { UserRoles } from '@platon/core/common';

@Controller('results')
export class ResultController {
  constructor(
    private readonly service: ResultService
  ) { }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Get('/:activityId')
  activityResults(
    @Param('activityId') activityId: string
  ): Promise<ActivityResults> {
    return this.service.activityResults(activityId);
  }

  @Get('/:activityId/:userId')
  async userResults(
    @Param('activityId') activityId: string,
    @Param('userId') userId: string
  ): Promise<UserResults> {
    return (
      await this.service.activityResults(activityId, userId)
    ).users[0];
  }
}
