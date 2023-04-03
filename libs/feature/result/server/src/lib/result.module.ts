import { Module } from '@nestjs/common';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { FeaturePlayerServerModule } from '@platon/feature/player/server';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';

@Module({
  imports: [
    FeaturePlayerServerModule,
    FeatureCourseServerModule,
  ],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService],
})
export class FeatureResultServerModule {}
