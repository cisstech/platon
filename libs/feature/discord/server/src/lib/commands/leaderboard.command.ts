import { Command, Handler, InjectDiscordClient, InteractionEvent, Param } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Public } from '@platon/core/server'
import { SlashCommandPipe } from '@discord-nestjs/common';
import { LeaderboardService } from '@platon/feature/result/server';
import { CourseLeaderboardEntry } from '@platon/feature/result/common';
import { ChatInputCommandInteraction, Client, Message, TextChannel } from 'discord.js';
import { WatchedChallengesService } from '../watchedChallenges.service';
import { ActivityEntity, ActivityService, OnTerminateActivityEventPayload } from '@platon/feature/course/server';
import { OnEvent } from '@nestjs/event-emitter';
import { WatchedChallengesEntity } from '../watchedChallenges.entity';
import { isUUID4 } from '@platon/shared/server';



export class LeaderboardDTO {
		@Param({ description: 'Provide the challenge id', required: true })
		id: string = '';
}

@Command({
  name: 'leaderboard',
  description: 'Get current leaderboard.',
	defaultMemberPermissions: '8'
})
@Injectable()
export class LeaderboardCommand  {
	private challengeToChannelMap: Map<string, [string, Message | undefined][]> = new Map();


	private updateChallengeToChannelMap(watchedChallenge: WatchedChallengesEntity, message?: Message<boolean>) {
		if (this.challengeToChannelMap.has(watchedChallenge.challengeId)) {
			const channelsWithMessage = this.challengeToChannelMap.get(watchedChallenge.challengeId);
			if (channelsWithMessage && channelsWithMessage?.flatMap((channel) => channel[0]).indexOf(watchedChallenge.channelId) === -1) {
				channelsWithMessage.push([watchedChallenge.channelId, message]);
			}
		}
		else {
			this.challengeToChannelMap.set(watchedChallenge.challengeId, [[watchedChallenge.channelId, message]]);
		}
	}

	deleteChallengeToChannelMap(challengeId: string, channelId: string) {
		if (this.challengeToChannelMap.has(challengeId)) {
			const channelsWithMessage = this.challengeToChannelMap.get(challengeId);
			if (channelsWithMessage) {
				const index = channelsWithMessage.flatMap((channel) => channel[0]).indexOf(channelId);
				if (index !== -1) { // delete the channel from the array
					channelsWithMessage.splice(index, 1);
				}
			}
		}
	}

	constructor(private readonly leaderBoardService : LeaderboardService, private readonly watchedChallengeService : WatchedChallengesService,
		@InjectDiscordClient() private readonly client: Client,  private readonly activityService: ActivityService) {
			this.watchedChallengeService.findAll().then((watchedChallenges) => {
				watchedChallenges.forEach((watchedChallenge) =>
					this.updateChallengeToChannelMap(watchedChallenge)
				);
			});
		}


	private async courseLeaderboard(id : string): Promise<CourseLeaderboardEntry[]> {
		return this.leaderBoardService.ofCourse(id);
	}


  @Public()
  @Handler()
  async onLeaderboard(@InteractionEvent(SlashCommandPipe) command: LeaderboardDTO, @InteractionEvent() info: ChatInputCommandInteraction): Promise<void> {
		const channelId = info.channelId; // Récupérer l'ID du canal, il y a sûrement mieux à faire. FIXME
		const challengeId = command.id; // Récupérer le contenu du message

		//Check si le challenge existe bien
		if (isUUID4(challengeId) === false) {
			info.reply("Mauvais format d'id... abandon");
			return ;
		}
		const activities = (await this.activityService.findActivitiesByCourseId(challengeId)).orUndefined();
		if (!activities) {
			info.reply("Le cours-challenge d'id : `" + challengeId + "` n'existe pas ou ne possède pas d'activités");
			return ;
		}
		if (!activities.find((activity : ActivityEntity) => activity.isChallenge)) {
			info.reply("Le cours-challenge d'id : `" + challengeId + "` n'est pas un challenge");
			return ;
		}
		// Enregistrer le courseId et le channelId dans la BDD
		const watchedChallenge = await this.watchedChallengeService.create({challengeId, channelId});

		// Récuperer l'id du message en dessous
		let message = await (await info.reply("Je posterais le leaderboard du cours-challenge d'id : `" + challengeId + "` ici")).fetch()
		this.updateChallengeToChannelMap(watchedChallenge, message);
}



	@OnEvent('activity.terminate')
  async onTerminate(event: OnTerminateActivityEventPayload ): Promise<void> {
		const channelsWithMessage = this.challengeToChannelMap.get(event.activity.courseId)

		const leaderboard = (await this.courseLeaderboard(event.activity.courseId)).slice(0, 60); // J'en prends que 60 pour le moment.

		const messageArray = leaderboard.map((entry, index) => {
			let symbol = '';
			if (index < 3) {
					switch (index) {
							case 0:
									symbol = '🥇';
									break;
							case 1:
									symbol = '🥈';
									break;
							case 2:
									symbol = '🥉';
									break;
							default:
									symbol = '';
									break;
					}
			}
			return index < 3 ? `### ${symbol} ${entry.user.firstName} ${entry.user.lastName?.toLocaleUpperCase()} : ${entry.points}` : `${entry.rank}. **${entry.user.firstName}** **${entry.user.lastName?.toLocaleUpperCase()}**    *(${entry.points})*`;
	});

	const messageContent = "# 🏆  Leaderboard  🏆\n" + messageArray.join('\n');

		if (!channelsWithMessage) {
			return ;
		}
		channelsWithMessage?.forEach((channelsWithMessage) => {
      const channel = this.client.channels.cache.get(channelsWithMessage[0]) as TextChannel;
			if (channelsWithMessage[1]) {
				channelsWithMessage[1]?.edit(messageContent).catch((error) => {
					console.error("Error while editing message : " + error);
				});
			}
			else {
				channel.send(messageContent).then((message) => {
					channelsWithMessage[1] = message;
				});
			}
    });
	}
}
