import { Module } from '@nestjs/common';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { FeaturePlayerServerModule } from '@platon/feature/player/server';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';

@Module({
  imports: [
    FeaturePlayerServerModule,
    FeatureCourseServerModule,
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class FeatureAnswerServerModule {}
