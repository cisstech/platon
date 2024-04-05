import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { LeaderboardCommand } from './commands/leaderboard.command';
import { FeatureResultServerModule } from '@platon/feature/result/server';
import { UnLeaderboardCommand } from './commands/unleaderboard.command';


@Module({
  imports: [DiscordModule.forFeature(), FeatureResultServerModule],
  providers: [LeaderboardCommand, UnLeaderboardCommand]
})
export class FeatureDiscordServerModule {}