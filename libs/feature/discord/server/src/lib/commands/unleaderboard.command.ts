import { Command, Handler, InteractionEvent } from '@discord-nestjs/core'
import { Injectable } from '@nestjs/common'
import { Public } from '@platon/core/server'
import { SlashCommandPipe } from '@discord-nestjs/common'
import { ChatInputCommandInteraction } from 'discord.js'
import { WatchedChallengesService } from '../watchedChallenges.service'
import { isUUID4 } from '@platon/shared/server'
import { LeaderboardCommand, LeaderboardDTO } from './leaderboard.command'

@Command({
  name: 'unleaderboard',
  description: 'Remove leaderboard display from the channel',
  defaultMemberPermissions: '8',
})
@Injectable()
export class UnLeaderboardCommand {
  constructor(
    private readonly leaderboardCommand: LeaderboardCommand,
    private readonly watchedChallengeService: WatchedChallengesService
  ) {}

  @Public()
  @Handler()
  OnUnleaderboard(
    @InteractionEvent(SlashCommandPipe) command: LeaderboardDTO,
    @InteractionEvent() info: ChatInputCommandInteraction
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!isUUID4(command.id)) {
        info.reply('Invalid challenge id')
        return reject()
      }
      this.watchedChallengeService.findById(command.id).then((watchedChallenge) => {
        const wc = watchedChallenge.orUndefined()
        if (!wc) {
          info.reply('No leaderboard found for this challenge')
          return reject()
        }

        this.leaderboardCommand.deleteChallengeToChannelMap(wc.challengeId, info.channelId)
        this.watchedChallengeService.delete(wc.id).then(() => {
          info.reply('Leaderboard removed')
          resolve()
        })
      })
    })
  }
}
