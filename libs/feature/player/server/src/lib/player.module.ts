import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { PlayerAnswerEntity } from './answers/answer.entity';
import { PlayerAnswerService } from './answers/answer.service';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { SandboxService } from './sandboxes/sandbox.service';
import { PlayerSessionEntity } from './sessions/session.entity';
import { PlayerSessionService } from './sessions/session.service';

@Module({
  controllers: [
    PlayerController,
  ],
  imports: [
    FeatureCourseServerModule,
    FeatureResourceServerModule,
    TypeOrmModule.forFeature([
      PlayerAnswerEntity,
      PlayerSessionEntity
    ])
  ],
  providers: [
    SandboxService,
    PlayerService,
    PlayerAnswerService,
    PlayerSessionService,
  ],
  exports: [
    TypeOrmModule,

    PlayerService,
    SandboxService
  ],
})
export class FeaturePlayerServerModule { }
