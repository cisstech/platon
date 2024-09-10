import { Module } from '@nestjs/common'
import { SyncResourceMetadatasCommand } from './database/sync-resource-metadata.command'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'
import { SyncActivities } from './database/sync-activities-command'

const commands = [SyncResourceMetadatasCommand, SyncActivities]

@Module({
  imports: [FeatureResourceServerModule],
  providers: [...commands],
  exports: [...commands],
})
export class CommandsModule {}
