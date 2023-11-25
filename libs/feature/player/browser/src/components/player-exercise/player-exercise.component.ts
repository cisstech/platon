import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core'
import { firstValueFrom } from 'rxjs'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { NzAlertModule } from 'ng-zorro-antd/alert'

import { SafePipeModule } from '@cisstech/nge/pipes'

import { DialogModule, DialogService } from '@platon/core/browser'
import { ExercisePlayer, PlayerActions, PlayerNavigation } from '@platon/feature/player/common'
import { WebComponentHooks } from '@platon/feature/webcomponent'

import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { ExerciseTheory } from '@platon/feature/compiler'
import { UiModalDrawerComponent } from '@platon/shared/ui'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { PlayerService } from '../../api/player.service'
import { PLAYER_FULLSCREEN } from '../../models/player.model'
import { PlayerCommentsComponent } from '../player-comments/player-comments.component'

type FullscreenElement = HTMLElement & {
  requestFullscreen?: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
  exitFullscreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

@Component({
  standalone: true,
  selector: 'player-exercise',
  templateUrl: './player-exercise.component.html',
  styleUrls: ['./player-exercise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzSpinModule,
    NzAlertModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    NzToolTipModule,
    MatDividerModule,
    NzSkeletonModule,
    MatExpansionModule,

    DialogModule,
    SafePipeModule,
    NgeMarkdownModule,
    UiModalDrawerComponent,

    PlayerCommentsComponent,
  ],
})
export class PlayerExerciseComponent implements OnInit, OnChanges {
  private readonly dialogService = inject(DialogService)
  private readonly playerService = inject(PlayerService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  @Input() player!: ExercisePlayer
  @Input() players: ExercisePlayer[] = []

  @Input() reviewMode = false
  @Input() canComment = false

  @Output() evaluated = new EventEmitter<PlayerNavigation>()

  @ViewChild('container', { read: ElementRef, static: true })
  container!: ElementRef<FullscreenElement>

  @ViewChild('errorTemplate', { read: TemplateRef, static: true })
  errorTemplate!: TemplateRef<object>

  @ViewChild('containerHints', { read: ElementRef })
  containerHints!: ElementRef<HTMLElement>

  @ViewChild('containerSolution', { read: ElementRef })
  containerSolution!: ElementRef<HTMLElement>

  protected index = 0
  protected loading = true
  protected fullscreen = false
  protected runningAction?: PlayerActions
  protected clearNotification?: () => void
  protected requestFullscreen?: () => void

  protected get disabled(): boolean {
    return !!this.player.solution || (this.player.remainingAttempts != null && this.player.remainingAttempts <= 0)
  }

  get currentAttemptIndex(): number {
    return this.index
  }

  get canRequestFullscreen(): boolean {
    return !!this.requestFullscreen && this.activatedRoute.snapshot.queryParamMap.has(PLAYER_FULLSCREEN)
  }

  ngOnInit(): void {
    this.requestFullscreen =
      this.container.nativeElement.requestFullscreen ||
      this.container.nativeElement.webkitRequestFullscreen ||
      this.container.nativeElement.mozRequestFullScreen ||
      this.container.nativeElement.msRequestFullscreen
  }

  ngOnChanges(): void {
    if (this.players?.length) {
      this.player = this.players[0]
      this.clearNotification?.()
      this.clearNotification = undefined
    }
  }

  protected async hint(): Promise<void> {
    await this.evaluate(PlayerActions.NEXT_HINT)
    this.scrollIntoNode(this.containerHints?.nativeElement, 'center')
  }

  protected check(): Promise<void> {
    return this.evaluate(PlayerActions.CHECK_ANSWER)
  }

  protected reroll(): Promise<void> {
    return this.evaluate(PlayerActions.REROLL_EXERCISE)
  }

  protected async solution(): Promise<void> {
    await this.evaluate(PlayerActions.SHOW_SOLUTION)
    this.scrollIntoNode(this.containerSolution?.nativeElement, 'start')
  }

  protected previousAttempt(): void {
    this.player = this.players[--this.index]
    this.changeDetectorRef.markForCheck()
  }

  protected nextAttempt(): void {
    this.player = this.players[++this.index]
    this.changeDetectorRef.markForCheck()
  }

  protected onRender(): void {
    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  protected async toggleFullscreen(): Promise<void> {
    if (this.fullscreen) {
      this.fullscreen = false
      const element = document as unknown as FullscreenElement
      element.exitFullscreen?.() ||
        element.webkitExitFullscreen?.() ||
        element.mozCancelFullScreen?.() ||
        element.msExitFullscreen?.()
    } else {
      this.fullscreen = true
      const element = this.container.nativeElement
      element.requestFullscreen?.() ||
        element.webkitRequestFullscreen?.() ||
        element.mozRequestFullScreen?.() ||
        element.msRequestFullscreen?.()
    }
  }

  protected trackByUrl(_: number, item: ExerciseTheory): string {
    return item.url
  }

  private answers(): Record<string, unknown> {
    const answers: Record<string, unknown> = {}
    this.forEachComponent((component) => {
      answers[component.state.cid] = Object.assign({}, component.state)
    })
    return answers
  }

  private forEachComponent(consumer: (component: WebComponentHooks) => void): void {
    document.querySelectorAll('[cid]').forEach((node) => {
      consumer(node as unknown as WebComponentHooks)
    })
  }

  private scrollIntoNode(node?: HTMLElement, position: ScrollLogicalPosition = 'start'): void {
    if (!node) return
    setTimeout(() => {
      node.scrollIntoView({
        behavior: 'smooth',
        block: position,
      })
      node.classList.add('animate')
      setTimeout(() => {
        node.classList.remove('animate')
      }, 500)
    })
  }

  private async evaluate(action: PlayerActions): Promise<void> {
    try {
      this.runningAction = action
      this.changeDetectorRef.markForCheck()

      this.clearNotification?.()
      this.clearNotification = undefined

      const answers = this.answers()

      const output = await firstValueFrom(
        this.playerService.evaluate({
          answers,
          action,
          sessionId: this.player.sessionId,
        })
      )

      this.player = output.exercise

      // little hack here to nge-markdown component to detect change in the case where theses
      // values are not modified during the evaluation on the server side
      const markdowns = ['form' as const, 'statement' as const, 'solution' as const]
      markdowns.forEach((key) => {
        if (this.player[key]) {
          this.player[key] += '\n'
        }
      })

      this.player.form = this.player.form + ''
      if (output.navigation) {
        this.evaluated.emit(output.navigation)
      }

      if (!this.player.feedbacks?.length && action === PlayerActions.CHECK_ANSWER) {
        this.dialogService.info('Votre réponse a bien été prise en compte.')
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const message = error.error?.message || error.message || 'Une erreur est survenue lors de cette action.'
        this.clearNotification = this.dialogService.notification(this.errorTemplate, {
          duration: 0,
          data: {
            message,
          },
        })
      }
    } finally {
      this.runningAction = undefined
      this.changeDetectorRef.markForCheck()
    }
  }
}
