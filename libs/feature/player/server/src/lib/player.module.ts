import { Module } from '@nestjs/common';
import { FeatureResourceServerModule } from '@platon/feature/resource/server';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { SandboxService } from './sandbox.service';

@Module({
  controllers: [
    PlayerController
  ],
  imports: [
    FeatureResourceServerModule,
  ],
  providers: [PlayerService, SandboxService],
  exports: [PlayerService, SandboxService],
})
export class FeaturePlayerServerModule { }
