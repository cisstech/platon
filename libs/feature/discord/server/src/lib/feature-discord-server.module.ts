import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { FeatureDiscordServerGateway } from './feature-discord-server.gateway';
import { LeaderboardCommand } from './commands/leaderboard.command';
import { RankCommand } from './commands/rank.command';
import { FeatureResultServerModule } from '@platon/feature/result/server';
import { UnLeaderboardCommand } from './commands/unleaderboard.command';


@Module({
  imports: [DiscordModule.forFeature(), FeatureResultServerModule],
  providers: [FeatureDiscordServerGateway, LeaderboardCommand, UnLeaderboardCommand, RankCommand]
})
export class FeatureDiscordServerModule {}