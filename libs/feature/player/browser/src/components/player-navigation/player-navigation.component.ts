import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { NzTimelineModule } from 'ng-zorro-antd/timeline';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ActivityPlayer, PlayerExercise } from '@platon/feature/player/common';

import { AnswerStatePipesModule } from '../../pipes/answer-state-pipes.module';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  standalone: true,
  selector: 'player-navigation',
  templateUrl: './player-navigation.component.html',
  styleUrls: ['./player-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    MatCardModule,
    MatButtonModule,
    NzPopconfirmModule,

    NzTimelineModule,

    AnswerStatePipesModule,
  ]
})
export class PlayerNavigationComponent {
  @Input() player!: ActivityPlayer;

  @Output() navigate = new EventEmitter<PlayerExercise>();
  @Output() terminate = new EventEmitter<void>();


  protected trackPage(_: number, page: PlayerExercise): string {
    return page.sessionId;
  }

  protected isActiveSession(sessionId: string): boolean {
    if ('composed' === this.player.settings?.navigation?.mode) {
      return false;
    }
    return sessionId === this.player.navigation.current?.sessionId;
  }
}
