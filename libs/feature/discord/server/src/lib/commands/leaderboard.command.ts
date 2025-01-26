import { Command, Handler, InjectDiscordClient, InteractionEvent, Param, ParamType } from '@discord-nestjs/core'
import { Injectable, Logger } from '@nestjs/common'
import { Public } from '@platon/core/server'
import { SlashCommandPipe } from '@discord-nestjs/common'
import { LeaderboardService } from '@platon/feature/result/server'
import { CourseLeaderboardEntry } from '@platon/feature/result/common'
import { ChatInputCommandInteraction, Client, Message, TextChannel } from 'discord.js'
import { WatchedChallengesService } from '../watchedChallenges.service'
import {
  ActivityEntity,
  ActivityService,
  ON_CHALLENGE_SUCCEEDED_EVENT,
  OnChallengeSuccededEventPayload,
} from '@platon/feature/course/server'
import { OnEvent } from '@nestjs/event-emitter'
import { WatchedChallengesEntity } from '../watchedChallenges.entity'
import { isUUID4 } from '@platon/shared/server'

export class LeaderboardDTO {
  @Param({ description: 'Provide the challenge id', required: true, type: ParamType.STRING })
  id = ''
}

@Command({
  name: 'leaderboard',
  description: 'Get current leaderboard.',
  defaultMemberPermissions: '8',
})
@Injectable()
export class LeaderboardCommand {
  private readonly logger = new Logger(LeaderboardCommand.name)
  private challengeToChannelMap: Map<string, [string, Message | undefined][]> = new Map()

  constructor(
    private readonly leaderBoardService: LeaderboardService,
    private readonly watchedChallengeService: WatchedChallengesService,
    @InjectDiscordClient() private readonly client: Client,
    private readonly activityService: ActivityService
  ) {
    this.watchedChallengeService
      .findAll()
      .then((watchedChallenges) => {
        watchedChallenges.forEach((watchedChallenge) => this.updateChallengeToChannelMap(watchedChallenge))
      })
      .catch((error) => {
        this.logger.error('Error while fetching watched challenges : ' + error)
      })
  }

  private updateChallengeToChannelMap(watchedChallenge: WatchedChallengesEntity, message?: Message<boolean>) {
    if (this.challengeToChannelMap.has(watchedChallenge.challengeId)) {
      const channelsWithMessage = this.challengeToChannelMap.get(watchedChallenge.challengeId)
      if (
        channelsWithMessage &&
        channelsWithMessage?.flatMap((channel) => channel[0]).indexOf(watchedChallenge.channelId) === -1
      ) {
        channelsWithMessage.push([watchedChallenge.channelId, message])
      }
    } else {
      this.challengeToChannelMap.set(watchedChallenge.challengeId, [[watchedChallenge.channelId, message]])
    }
  }

  deleteChallengeToChannelMap(challengeId: string, channelId: string) {
    if (this.challengeToChannelMap.has(challengeId)) {
      const channelsWithMessage = this.challengeToChannelMap.get(challengeId)
      if (channelsWithMessage) {
        const index = channelsWithMessage.flatMap((channel) => channel[0]).indexOf(channelId)
        if (index !== -1) {
          // delete the channel from the array
          channelsWithMessage.splice(index, 1)
        }
      }
    }
  }

  private async courseLeaderboard(id: string): Promise<CourseLeaderboardEntry[]> {
    return this.leaderBoardService.ofCourse(id)
  }

  @Public()
  @Handler()
  async onLeaderboard(
    @InteractionEvent(SlashCommandPipe) command: LeaderboardDTO,
    @InteractionEvent() info: ChatInputCommandInteraction
  ): Promise<void> {
    const channelId = info.channelId // Récupérer l'ID du canal, il y a sûrement mieux à faire. FIXME
    const challengeId = command.id // Récupérer le contenu du message

    //Check si le challenge existe bien
    if (isUUID4(challengeId) === false) {
      info.reply("Mauvais format d'id... abandon").catch((error) => {
        this.logger.error('Error while replying : ' + error)
      })
      return
    }
    const activities = (await this.activityService.findActivitiesByCourseId(challengeId)).orUndefined()
    if (!activities) {
      info
        .reply("Le cours-challenge d'id : `" + challengeId + "` n'existe pas ou ne possède pas d'activités")
        .catch((error) => {
          this.logger.error('Error while replying : ' + error)
        })
      return
    }
    if (!activities.find((activity: ActivityEntity) => activity.isChallenge)) {
      info.reply("Le cours-challenge d'id : `" + challengeId + "` n'est pas un challenge").catch((error) => {
        this.logger.error('Error while replying : ' + error)
      })
      return
    }
    // Enregistrer le courseId et le channelId dans la BDD
    const watchedChallenge = await this.watchedChallengeService.create({ challengeId, channelId })

    // Récuperer l'id du message en dessous
    const message = await (
      await info.reply("Je posterais le leaderboard du cours-challenge d'id : `" + challengeId + '` ici')
    ).fetch()
    this.updateChallengeToChannelMap(watchedChallenge, message)
  }

  @OnEvent(ON_CHALLENGE_SUCCEEDED_EVENT)
  async onTerminate(event: OnChallengeSuccededEventPayload): Promise<void> {
    if (!event.activity.isChallenge) {
      return
    }
    const channelsWithMessage = this.challengeToChannelMap.get(event.activity.courseId)

    const leaderboard = (await this.courseLeaderboard(event.activity.courseId)).slice(0, 50)

    const messageArray = leaderboard.map((entry, index) => {
      let symbol = ''
      if (index < 3) {
        switch (index) {
          case 0:
            symbol = '🥇'
            break
          case 1:
            symbol = '🥈'
            break
          case 2:
            symbol = '🥉'
            break
          default:
            symbol = ''
            break
        }
      }
      return index < 3
        ? `### ${symbol} ${entry.user.firstName} ${entry.user.lastName?.toLocaleUpperCase()} : ${entry.points}`
        : `${entry.rank}. **${entry.user.firstName} ${entry.user.lastName?.toLocaleUpperCase()}**    *(${
            entry.points
          })*`
    })

    const messageContent = '# 🏆  Leaderboard  🏆\n' + messageArray.join('\n')
    if (messageContent.length > 2000) {
      this.logger.warn('Message too long')
      messageContent.slice(0, 1995).concat('...')
    }

    if (!channelsWithMessage) {
      return
    }
    channelsWithMessage?.forEach((channelsWithMessage) => {
      const channel = this.client.channels.cache.get(channelsWithMessage[0]) as TextChannel
      if (channelsWithMessage[1]) {
        channelsWithMessage[1]?.edit(messageContent).catch((error) => {
          this.logger.error('Error while editing message : ' + error)
        })
      } else {
        channel
          .send(messageContent)
          .then((message) => {
            channelsWithMessage[1] = message
          })
          .catch((error) => {
            this.logger.error('Error while sending message : ' + error)
          })
      }
    })
  }
}
