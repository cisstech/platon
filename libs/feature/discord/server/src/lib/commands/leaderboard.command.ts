import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Command({
  name: 'leaderboard',
  description: 'Get current leaderboard.',
})
@Injectable()
export class LeaderboardCommand {
    leaderboard = [{
        name: 'Valentin',
        points: 100,
    }, {
        name: 'MAthieu',
        points: 90,
    }, {
        name: 'MAmadou',
        points: 80,
    }, {
        name: 'DOminique',
        points: 70,
    }, {
        name: 'NIcolas',
        points: 60,
    }, {
        name: 'Tgomas',
        points: 50,
    }, {
        name: 'Olivier',
        points: 40,
    }, {
        name: 'Koïchiro',
        points: 30,
    }, {
        name: 'Latable',
        points: 20,
    }, {
        name: 'L\'affiche de monsieur borie',
        points: 10,
    }];

  @Handler()
  onLeaderboard(interaction: CommandInteraction): string {
    return this.leaderboard.map((user, index) => `${index + 1}. ${user.name} - ${user.points}`).join('\n');
  }
}