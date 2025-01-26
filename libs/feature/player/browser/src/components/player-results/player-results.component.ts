import { CommonModule, KeyValue } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild, inject } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ActivityPlayer, ExercisePlayer } from '@platon/feature/player/common'
import { AnswerStatePipesModule, ResultService } from '@platon/feature/result/browser'
import { UserExerciseResults, UserResults } from '@platon/feature/result/common'
import { DurationPipe, UiModalTemplateComponent } from '@platon/shared/ui'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { firstValueFrom } from 'rxjs'
import { PlayerService } from '../../api/player.service'
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'

@Component({
  standalone: true,
  selector: 'player-results',
  templateUrl: './player-results.component.html',
  styleUrls: ['./player-results.component.scss', '../common.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    DurationPipe,
    PlayerExerciseComponent,
    AnswerStatePipesModule,
    UiModalTemplateComponent,
  ],
})
export class PlayerResultsComponent implements OnInit {
  private readonly resultService = inject(ResultService)
  private readonly playerService = inject(PlayerService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly breakpointObserver = inject(BreakpointObserver)

  @Input() player!: ActivityPlayer

  @ViewChild(UiModalTemplateComponent)
  protected modal!: UiModalTemplateComponent

  protected results?: UserResults
  protected answers: ExercisePlayer[] = []
  protected displayAll = false

  protected get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])
  }

  async ngOnInit(): Promise<void> {
    this.results = await firstValueFrom(this.resultService.sessionResults(this.player.sessionId))
    this.changeDetectorRef.markForCheck()
  }

  protected keepOriginalOrder = (_a: KeyValue<unknown, unknown>, _b: KeyValue<unknown, unknown>): number => {
    return 0
  }

  protected async playAnswers(result: UserExerciseResults): Promise<void> {
    if (result.sessionId) {
      this.answers = (
        await firstValueFrom(
          this.playerService.playAnswers({
            sessionId: result.sessionId,
          })
        )
      ).exercises
    }
    this.modal.open()
    this.changeDetectorRef.markForCheck()
  }
}
