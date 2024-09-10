import { Module } from '@nestjs/common'
import { DiscordModule } from '@discord-nestjs/core'
import { LeaderboardCommand } from './commands/leaderboard.command'
import { FeatureResultServerModule } from '@platon/feature/result/server'
import { UnLeaderboardCommand } from './commands/unleaderboard.command'
import { WatchedChallengesService } from './watchedChallenges.service'
import { WatchedChallengesEntity } from './watchedChallenges.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitationCommand } from './commands/invitation.command'
import { FeatureDiscordServerController } from './feature-discord-server.controller'
import { DiscordInvitationEntity } from './discord-invitation/discord-invitation.entity'
import { DiscordInvitationService } from './discord-invitation/discord-invitation.service'
import { DiscordWatcherService } from './watchers/discord-watcher.service'
import { UserModule } from '@platon/core/server'

@Module({
  controllers: [FeatureDiscordServerController],
  imports: [
    DiscordModule.forFeature(),
    FeatureResultServerModule,
    UserModule,
    TypeOrmModule.forFeature([WatchedChallengesEntity, DiscordInvitationEntity]),
  ],
  providers: [
    LeaderboardCommand,
    UnLeaderboardCommand,
    InvitationCommand,
    WatchedChallengesService,
    DiscordInvitationService,
    DiscordWatcherService,
  ],
})
export class FeatureDiscordServerModule {}
