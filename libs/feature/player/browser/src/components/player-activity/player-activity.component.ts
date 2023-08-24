import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core'
import { firstValueFrom } from 'rxjs'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'

import { NzAffixModule } from 'ng-zorro-antd/affix'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'

import { SafePipeModule } from '@cisstech/nge/pipes'
import {
  ActivityPlayer,
  ExercisePlayer,
  getClosingTime,
  isTimeouted,
  Player,
  PlayerExercise,
  PlayerNavigation,
} from '@platon/feature/player/common'

import { DialogModule, DialogService, UserAvatarComponent } from '@platon/core/browser'
import { ActivityOpenStates, calculateActivityOpenState } from '@platon/feature/course/common'

import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { PlayerService } from '../../api/player.service'
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component'
import { PlayerNavigationComponent } from '../player-navigation/player-navigation.component'
import { PlayerResultsComponent } from '../player-results/player-results.component'
import { PlayerSettingsComponent } from '../player-settings/player-settings.component'

@Component({
  standalone: true,
  selector: 'player-activity',
  templateUrl: './player-activity.component.html',
  styleUrls: ['./player-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,

    NzAffixModule,
    NzBadgeModule,
    NzStatisticModule,

    DialogModule,
    SafePipeModule,
    UserAvatarComponent,
    NgeMarkdownModule,

    PlayerResultsComponent,
    PlayerExerciseComponent,
    PlayerSettingsComponent,
    PlayerNavigationComponent,
  ],
})
export class PlayerActivityComponent implements OnInit {
  @Input() player!: ActivityPlayer

  protected state?: ActivityOpenStates
  protected countdown?: number | null
  protected triggers: {
    time: number
    execute: () => void
  }[] = []

  protected countdownColor = 'black'

  protected exercises?: ExercisePlayer[]

  @HostBinding('class.play-mode')
  protected get hostClasses(): boolean {
    return !!this.exercises && !!this.player.navigation
  }

  protected get composed(): boolean {
    return 'composed' === this.player.settings?.navigation?.mode
  }

  protected get navigation(): PlayerNavigation {
    return this.player.navigation
  }

  protected get showConclusion(): boolean {
    const { navigation } = this.player
    return this.state === 'closed' || navigation.terminated
  }

  protected get showIntroduction(): boolean {
    const { navigation } = this.player
    return this.state === 'opened' && !navigation.started && !navigation.terminated
  }

  constructor(
    private readonly dialogService: DialogService,
    private readonly playerService: PlayerService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.state = calculateActivityOpenState(this.player)

    if (this.state === 'opened') {
      if (isTimeouted(this.player) && !this.player.navigation.terminated) {
        this.terminate()
        return
      }
      const { navigation } = this.player
      if (navigation.started && !navigation.terminated) {
        this.start()
      }
    } else if (this.state === 'planned') {
      this.countdown = new Date(this.player.openAt as Date).getTime()
    }
  }

  protected async start(): Promise<void> {
    if (this.composed) {
      await this.playAll()
      return
    }
    const { navigation } = this.player
    await this.play(navigation.current || navigation.exercises[0])
  }

  protected async terminate(): Promise<void> {
    this.triggers = []

    const output = await firstValueFrom(this.playerService.terminate(this.player.sessionId))
    this.player = output.activity
    this.exercises = undefined
    this.changeDetectorRef.markForCheck()
  }

  protected async play(exercise: PlayerExercise) {
    if (this.composed) {
      this.jumpToExercise(exercise)
      return
    }

    this.exercises = undefined

    const output = await firstValueFrom(
      this.playerService.playExercises({
        activitySessionId: this.player.sessionId,
        exerciseSessionIds: [exercise.sessionId],
      })
    )

    if (output.navigation) {
      this.player.navigation = output.navigation
    }

    this.exercises = output.exercises

    this.initializeCountdown()
    this.changeDetectorRef.markForCheck()
  }

  protected async playAll(): Promise<void> {
    const output = await firstValueFrom(
      this.playerService.playExercises({
        activitySessionId: this.player.sessionId,
        exerciseSessionIds: this.player.navigation.exercises.map((item) => item.sessionId),
      })
    )

    this.exercises = output.exercises
    if (output.navigation) {
      this.player.navigation = output.navigation
    }

    this.initializeCountdown()
    this.changeDetectorRef.markForCheck()
  }

  protected trackBySessionId(_: number, item: Player): string {
    return item.sessionId
  }

  protected onFinishCountdown(): void {
    if (this.state === 'planned') {
      this.state = 'opened'
      const { navigation } = this.player
      if (navigation.started && !navigation.terminated) {
        this.start()
      }
      this.dialogService.info("L'activité vient de commencer. Vous pouvez maintenant y participer.")
      this.changeDetectorRef.markForCheck()
    } else {
      this.dialogService.info("L'activité est désormais terminée. Merci d'avoir participé.")
      this.terminate()
    }
  }

  protected onChangeNavigation(navigation: PlayerNavigation): void {
    this.player = { ...this.player, navigation }
  }

  private jumpToExercise(page: PlayerExercise) {
    const node = document.getElementById(page.sessionId)
    if (node) {
      node.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      node.classList.add('animate')
    }
    setTimeout(() => {
      node?.classList?.remove('animate')
    }, 500)
  }

  private initializeCountdown(): void {
    this.triggers = []
    this.countdownColor = 'black'
    this.player.startedAt = this.player.startedAt || new Date()
    this.countdown = getClosingTime(this.player)

    const changeColor = (color: string, message: string) => {
      this.countdownColor = color
      this.dialogService.info(message)
    }

    if (this.countdown) {
      const endAt = this.countdown
      const startAt = new Date(this.player.startedAt as Date).getTime()
      const duration = endAt - startAt
      const currentTime = new Date().getTime()
      if (currentTime >= startAt + duration) {
        this.countdown = null
        return
      }

      if (currentTime > startAt + duration * 0.5) {
        changeColor('orange', "Attention : vous avez dépassé la moitié du temps de l'activité.")
      } else {
        this.triggers.push({
          time: startAt + duration * 0.5,
          execute: () => changeColor('orange', "Attention : vous avez dépassé la moitié du temps de l'activité."),
        })
      }

      if (currentTime > startAt + duration * 0.75) {
        changeColor('#f5222d', "Urgent : il ne vous reste que 25% du temps de l'activité.")
      } else {
        this.triggers.push({
          time: startAt + duration * 0.75,
          execute: () => changeColor('#f5222d', "Urgent : il ne vous reste que 25% du temps de l'activité."),
        })
      }
    }
  }
}
