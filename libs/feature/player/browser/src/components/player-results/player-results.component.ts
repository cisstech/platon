import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@platon/core/browser';
import { ActivityPlayer, ExercisePlayer } from '@platon/feature/player/common';
import { AnswerStatePipesModule, ResultService } from '@platon/feature/result/browser';
import { UserExerciseResults, UserResults } from '@platon/feature/result/common';
import { DurationPipe, UiModalTemplateComponent } from '@platon/shared/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '../../api/player.service';
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component';

@Component({
  standalone: true,
  selector: 'player-results',
  templateUrl: './player-results.component.html',
  styleUrls: ['./player-results.component.scss', '../common.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzButtonModule,
    NzToolTipModule,
    DurationPipe,
    PlayerExerciseComponent,
    AnswerStatePipesModule,
    UiModalTemplateComponent,
  ],
})
export class PlayerResultsComponent implements OnInit {
  @Input() player!: ActivityPlayer;

  @ViewChild(UiModalTemplateComponent)
  protected modal!: UiModalTemplateComponent;

  protected results?: UserResults;
  protected answers: ExercisePlayer[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly resultService: ResultService,
    private readonly playerService: PlayerService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.results = await firstValueFrom(
      this.resultService.sessionResults(
        this.player.sessionId
      )
    );
    this.changeDetectorRef.markForCheck();
  }

  protected async playAnswers(result: UserExerciseResults): Promise<void> {
    if (result.sessionId) {
      this.answers = (await firstValueFrom(this.playerService.playAnswers({
        sessionId: result.sessionId,
      }))).exercises;
    }
    this.modal.open();
    this.changeDetectorRef.markForCheck();
  }
}
