import { Controller, Get, Param } from '@nestjs/common';
import { TeacherResultsData } from '@platon/feature/answer/common';
import { AnswerService } from './answer.service';

@Controller('answers/:activityId')
export class AnswerController {
  constructor(
    private readonly service: AnswerService
  ) { }

  @Get('results/teacher')
  resultsByExercises(
    @Param('activityId') activityId: string
  ): Promise<TeacherResultsData> {
    return this.service.resultsForTeacher(activityId);
  }
}
