import { Controller, Get, Param } from '@nestjs/common';
import { ActivityResults } from '@platon/feature/result/common';
import { ResultService } from './result.service';

@Controller('results')
export class ResultController {
  constructor(
    private readonly service: ResultService
  ) { }

  @Get('/:activityId')
  activityResults(
    @Param('activityId') activityId: string
  ): Promise<ActivityResults> {
    return this.service.activityResults(activityId);
  }
}
