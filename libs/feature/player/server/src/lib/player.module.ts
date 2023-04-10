import { Module } from '@nestjs/common';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { FeatureResultServerModule } from '@platon/feature/result/server';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { SandboxService } from './sandboxes/sandbox.service';

@Module({
  controllers: [
    PlayerController,
  ],
  imports: [
    FeatureCourseServerModule,
    FeatureResultServerModule,
    FeatureResourceServerModule,
  ],
  providers: [
    SandboxService,
    PlayerService,
  ],
  exports: [
    PlayerService,
    SandboxService
  ],
})
export class FeaturePlayerServerModule { }
