import { Command, Handler, InteractionEvent, Param } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Public } from '@platon/core/server'
import { SlashCommandPipe } from '@discord-nestjs/common';
import { LeaderboardService } from '@platon/feature/result/server';
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common';

export class LeaderboardDTO {
		@Param({ description: 'Provide the challenge id', required: true })
		id: string = '';
}

@Command({
  name: 'leaderboard',
  description: 'Get current leaderboard.',
})


@Injectable()
export class LeaderboardCommand {

	constructor(private readonly leaderBoardService : LeaderboardService) {}

  async courseLeaderboard(id : string): Promise<CourseLeaderboardEntry[]> {
		const leaderboard = await this.leaderBoardService.ofCourse(id);
		return leaderboard;
	}

	async activityLeaderboard(id : string): Promise<ActivityLeaderboardEntry[]> {
		const leaderboard = await this.leaderBoardService.ofActivity(id);
		return leaderboard;
	}

  @Public()
  @Handler()
  async onLeaderboard(@InteractionEvent(SlashCommandPipe) command: LeaderboardDTO): Promise<string> {
		const leaderboard = await this.courseLeaderboard(command.id);
		const activityLeaderboard = await this.activityLeaderboard(command.id);
		console.log(command.id);
		console.log("course lb : "+leaderboard);
		console.log("Activity lb : "+activityLeaderboard);
		let response = '';	
		leaderboard.forEach((entry, index) => {
			response += `${index + 1}. ${entry.user} - ${entry.points}\n`;
		});
		return response;
  }
}