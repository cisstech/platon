import { Module } from '@nestjs/common'
import { SyncResourceMetadatasCommand } from './database/sync-resource-metadata.command'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'

const commands = [SyncResourceMetadatasCommand]

@Module({
  imports: [FeatureResourceServerModule],
  providers: [...commands],
  exports: [...commands],
})
export class CommandsModule {}
