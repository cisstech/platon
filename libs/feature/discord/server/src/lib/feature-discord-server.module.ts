import { Module } from '@nestjs/common'
import { DiscordModule } from '@discord-nestjs/core'
import { LeaderboardCommand } from './commands/leaderboard.command'
import { FeatureResultServerModule } from '@platon/feature/result/server'
import { UnLeaderboardCommand } from './commands/unleaderboard.command'
import { WatchedChallengesService } from './watchedChallenges.service'
import { WatchedChallengesEntity } from './watchedChallenges.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [DiscordModule.forFeature(), FeatureResultServerModule, TypeOrmModule.forFeature([WatchedChallengesEntity])],
  providers: [LeaderboardCommand, UnLeaderboardCommand, WatchedChallengesService],
})
export class FeatureDiscordServerModule {}
