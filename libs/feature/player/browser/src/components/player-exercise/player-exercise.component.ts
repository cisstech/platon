import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';

import { NzAlertModule } from 'ng-zorro-antd/alert';

import { SafePipeModule } from '@cisstech/nge/pipes';

import { DialogModule, DialogService } from '@platon/core/browser';
import { ExercisePlayer, PlayerActions, PlayerNavigation } from '@platon/feature/player/common';
import { WebComponentHooks } from '@platon/feature/webcomponent';

import { ExerciseTheory } from '@platon/feature/compiler';
import { PlayerService } from '../../api/player.service';

@Component({
  standalone: true,
  selector: 'player-exercise',
  templateUrl: './player-exercise.component.html',
  styleUrls: ['./player-exercise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,

    NzAlertModule,

    DialogModule,
    SafePipeModule,
    NgeMarkdownModule,
  ]
})
export class PlayerExerciseComponent {
  @Input() player!: ExercisePlayer;
  @Output() evaluated = new EventEmitter<PlayerNavigation>();

  protected get disabled(): boolean {
    return !!this.player.solution || (
      this.player.remainingAttempts != null && this.player.remainingAttempts <= 0
    );
  }

  constructor(
    private readonly dialogService: DialogService,
    private readonly playerService: PlayerService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }


  protected hint(): Promise<void> {
    return this.evaluate(PlayerActions.NEXT_HINT);
  }

  protected check(): Promise<void> {
    return this.evaluate(PlayerActions.CHECK_ANSWER);
  }

  protected reroll(): Promise<void> {
    return this.evaluate(PlayerActions.REROLL_EXERCISE);
  }

  protected solution(): Promise<void> {
    return this.evaluate(PlayerActions.SHOW_SOLUTION);
  }

  protected trackByUrl(_: number, item: ExerciseTheory): string {
    return item.url;
  }

  private answers(): Record<string, unknown> {
    const answers: Record<string, unknown> = {};
    this.forEachComponent(component => {
      answers[component.state.cid] = Object.assign({}, component.state);
    });
    return answers;
  }

  private forEachComponent(
    consumer: (component: WebComponentHooks) => void
  ): void {
    document.querySelectorAll('[cid]').forEach(node => {
      consumer((node as unknown as WebComponentHooks));
    });
  }

  private async evaluate(action: PlayerActions): Promise<void> {
    try {
      const answers = this.answers();

      const output = await firstValueFrom(
        this.playerService.evaluate({
          answers,
          action,
          sessionId: this.player.sessionId,
        })
      );

      this.player = output.exercise;
      if (output.navigation) {
        this.evaluated.emit(output.navigation);
      }

      if (!this.player.feedbacks?.length && action === PlayerActions.CHECK_ANSWER) {
        this.dialogService.info('Votre réponse a bien été prise en compte.');
      }
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action.');
    } finally {
      this.changeDetectorRef.markForCheck();
    }
  }
}
