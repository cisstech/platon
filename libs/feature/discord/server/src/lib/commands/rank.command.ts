import { Command, InteractionEvent, Handler, Param, ParamType } from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { Injectable } from '@nestjs/common';
import { Public } from '@platon/core/server';


export class rankDTO {
    @Param({ description: 'User name', required: true })
    name: string = '';
}

@Command({
  name: 'rank',
  description: 'Get someone\'s rank.',
})

@Injectable()
export class RankCommand {
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
        points: 70,
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
    },
    {
        name: 'Jean-Pascal Trinh',
        points: 0,
    }];


  @Public()
  @Handler()
  onRank(@InteractionEvent(SlashCommandPipe) command: rankDTO): string {
    const user = this.leaderboard.find((user) => user.name.toLowerCase() === command.name.toLowerCase());
    if (user) {
      return `${user.name} has ${user.points} points.`;
    }
    return 'User not found.';
  }
}
