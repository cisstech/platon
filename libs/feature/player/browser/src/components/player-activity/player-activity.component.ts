import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core'
import { firstValueFrom, Subscription } from 'rxjs'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'

import { SafePipe } from '@cisstech/nge/pipes'
import {
  ActivityPlayer,
  ExercisePlayer,
  getClosingTime,
  isTimeouted,
  NO_COPY_PASTER_CLASS_NAME,
  Player,
  PlayerExercise,
  PlayerNavigation,
} from '@platon/feature/player/common'

import { DialogModule, DialogService, UserAvatarComponent } from '@platon/core/browser'
import { ActivityClosedNotification, ActivityOpenStates } from '@platon/feature/course/common'

import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { AnswerStates } from '@platon/feature/result/common'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { PlayerService } from '../../api/player.service'
import { PLAYER_EDITOR_PREVIEW } from '../../models/player.model'
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component'
import { PlayerNavigationComponent } from '../player-navigation/player-navigation.component'
import { PlayerResultsComponent } from '../player-results/player-results.component'
import { PlayerSettingsComponent } from '../player-settings/player-settings.component'
import { NotificationService } from '@platon/feature/notification/browser'
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzProgressModule } from 'ng-zorro-antd/progress'

@Component({
  standalone: true,
  selector: 'player-activity',
  templateUrl: './player-activity.component.html',
  styleUrls: ['./player-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    MatCardModule,
    MatButtonModule,

    NzAlertModule,
    NzBadgeModule,
    NzPopoverModule,
    NzStatisticModule,
    NzButtonModule,
    NzProgressModule,

    SafePipe,
    DialogModule,
    UserAvatarComponent,
    NgeMarkdownModule,

    PlayerResultsComponent,
    PlayerExerciseComponent,
    PlayerSettingsComponent,
    PlayerNavigationComponent,
  ],
})
export class PlayerActivityComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly dialogService = inject(DialogService)
  private readonly playerService = inject(PlayerService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected state?: ActivityOpenStates
  protected answerStates: Record<string, AnswerStates> = {}

  protected countdown?: number | null
  protected countdownColor = 'black'
  protected countdownBreakpoints: {
    time: number
    action: () => void
  }[] = []

  protected empty = false
  protected hasNext?: boolean
  protected hasPrev?: boolean
  protected position = 0
  protected exercises?: ExercisePlayer[]
  protected navExerciceCount = 0
  protected terminatedAfterLoseFocus = false
  protected terminatedAfterLeavePage = false
  protected onLoseTabFocusFn = this.onLoseTabFocus.bind(this)
  protected onVisibilityChangeFn = this.onVisibilityChange.bind(this)
  protected onKeydownFn = this.onKeydown.bind(this)
  protected onContextMenuFn = this.onContextMenu.bind(this)

  @Input() player!: ActivityPlayer

  protected get composed(): boolean {
    return this.player.settings?.navigation?.mode === 'composed'
  }

  protected get isPlaying(): boolean {
    return !!this.exercises
  }

  protected get navigation(): PlayerNavigation {
    return this.player.navigation
  }

  protected get showConclusion(): boolean {
    const { navigation } = this.player
    return this.state === 'closed' || navigation.terminated
  }

  protected get canGoDashboard(): boolean {
    return !this.activatedRoute.snapshot.queryParamMap.has(PLAYER_EDITOR_PREVIEW)
  }

  protected get showIntroduction(): boolean {
    const { navigation } = this.player
    return this.state === 'opened' && !navigation.started && !navigation.terminated
  }

  private readonly subscriptions: Subscription[] = []
  private notificationsCount = -1

  private showSucceededPopup = true

  private modal: NzModalRef | undefined

  protected isModalLoading = false

  protected isModalForceChoice = false
  protected modalForceChoiceProgress = 0
  private countdownInterval: NodeJS.Timer | undefined
  private autoChoiceTimeout: NodeJS.Timeout | undefined

  @ViewChild('modalFooter', { static: true }) modalFooter!: TemplateRef<object>

  @ViewChildren('playerExercise') playerExerciseComponents!: QueryList<PlayerExerciseComponent>

  constructor(
    private readonly notificationSerivce: NotificationService,
    private readonly nzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.calculateAnswerStates(this.player.navigation)

    this.state = this.player.state
    this.empty = !this.player.navigation.exercises?.length

    if (this.state === 'opened') {
      if (isTimeouted(this.player) && !this.player.navigation.terminated) {
        this.terminate().catch(console.error)
        return
      }
      const { navigation } = this.player
      if (navigation.started && !navigation.terminated) {
        this.start().catch(console.error)
      }
    } else if (this.state === 'planned') {
      const delta = new Date(this.player.openAt as Date).getTime() - new Date(this.player.serverTime).getTime()
      this.countdown = Date.now() + delta
    }

    this.subscriptions.push(
      this.notificationSerivce.paginate().subscribe(async ({ notifications }) => {
        if (this.notificationsCount === -1) {
          this.notificationsCount = notifications.length
        } else if (notifications.length !== this.notificationsCount) {
          this.notificationsCount = notifications.length
          if (
            notifications.length > 0 &&
            (notifications[0].data as ActivityClosedNotification).type === 'ACTIVITY-CLOSED' &&
            (notifications[0].data as ActivityClosedNotification).activityId === this.player.activityId
          ) {
            this.state = 'closed'
            await this.terminateModal(false, "L'activité a été fermée par l'enseignant.")
          }
        }
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  private async evaluateAll(): Promise<void> {
    await Promise.all(this.playerExerciseComponents.map((component) => component.evaluateFromActivity()))
  }

  ngOnDestroy(): void {
    this.stopCountdown()
    this.enableCopyPasteIfNeeded()
    this.stopWatchingVisibilityChange()
  }

  protected async start(): Promise<void> {
    if (this.composed) {
      await this.playAll()
    } else {
      const { navigation } = this.player
      await this.play(navigation.current || navigation.exercises[0])
    }

    this.disableCopyPasteIfNeeded()
    this.startWatchingVisibilityChange()
  }

  protected async terminateModal(isClosable: boolean, title: string): Promise<void> {
    if (!this.navigation.started || this.navigation.terminated) {
      this.terminate().catch(console.error)
      return
    }
    if (this.modal) {
      this.modal.destroy()
    }
    this.modal = this.nzModalService.create({
      nzTitle: title,
      nzContent: 'Après avoir quitté cette activité, vous ne pourrez plus modifier vos réponses.',
      nzClosable: isClosable,
      nzMaskClosable: isClosable,
      nzOnCancel: () => {
        if (!isClosable) {
          this.terminate().catch(console.error)
        }
        this.modal?.destroy()
      },
      nzKeyboard: false,
      nzFooter: this.modalFooter,
    })
    if (!isClosable) {
      this.isModalForceChoice = true
      this.startCountdown()
    }
  }

  private startCountdown(): void {
    this.autoChoiceTimeout = setTimeout(() => {
      this.modalCancel().catch(console.error)
    }, 10000)
    this.countdownInterval = setInterval(() => {
      if (this.modalForceChoiceProgress < 100) {
        this.modalForceChoiceProgress++
      }
    }, 100)
  }

  private stopCountdown(): void {
    if (this.autoChoiceTimeout) {
      clearTimeout(this.autoChoiceTimeout)
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }

  protected async modalConfirm(): Promise<void> {
    this.isModalLoading = true
    this.stopCountdown()
    await this.evaluateAll()
    this.terminate().catch(console.error)
    this.modal?.destroy()
  }

  protected async modalCancel(): Promise<void> {
    this.stopCountdown()
    this.terminate().catch(console.error)
    this.modal?.destroy()
  }

  protected async terminate(): Promise<void> {
    this.countdownBreakpoints = []

    const output = await firstValueFrom(this.playerService.terminate(this.player.sessionId))
    this.player = output.activity
    this.exercises = undefined

    this.enableCopyPasteIfNeeded()
    this.stopWatchingVisibilityChange()

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

    this.calculatePositions()
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

    this.calculatePositions()
    this.initializeCountdown()
    this.changeDetectorRef.markForCheck()
  }

  protected trackBySessionId(_: number, item: Player): string {
    return item.sessionId
  }

  protected async onFinishCountdown(): Promise<void> {
    if (this.state === 'planned') {
      this.state = 'opened'
      const { navigation } = this.player
      if (navigation.started && !navigation.terminated) {
        this.start().catch(console.error)
      }
      this.dialogService.info("L'activité vient de commencer. Vous pouvez maintenant y participer.")
      this.changeDetectorRef.markForCheck()
    } else {
      this.dialogService.info("L'activité est désormais terminée. Merci d'avoir participé.")
      await this.terminateModal(false, "L'activité est terminée.")
    }
  }

  protected onChangeNavigation(navigation: PlayerNavigation): void {
    if (this.showSucceededPopup && navigation.exercises.every((exercise) => exercise.state === 'SUCCEEDED')) {
      this.showSucceededPopup = false
      this.dialogService
        .confirm({
          nzTitle: `Vous avez complété tous les exercices avec succès.`,
          nzContent: `Voulez-vous terminer l'activité ? \nAprès avoir terminé l'activité, vous ne pourrez plus modifier vos réponses.`,
          nzOkText: 'Terminer',
          nzOkDanger: true,
          nzCancelText: 'Annuler',
        })
        .then((confirmed) => {
          if (confirmed) {
            this.terminate().catch(console.error)
          }
        })
        .catch(console.error)
    }
    this.player = { ...this.player, navigation }
    this.calculatePositions()
    this.calculateAnswerStates(navigation)
  }

  private jumpToExercise(page: PlayerExercise): void {
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
    this.countdownBreakpoints = []
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
        this.countdownBreakpoints.push({
          time: startAt + duration * 0.5,
          action: () => changeColor('orange', "Attention : vous avez dépassé la moitié du temps de l'activité."),
        })
      }

      if (currentTime > startAt + duration * 0.75) {
        changeColor('#f5222d', "Urgent : il ne vous reste que 25% du temps de l'activité.")
      } else {
        this.countdownBreakpoints.push({
          time: startAt + duration * 0.75,
          action: () => changeColor('#f5222d', "Urgent : il ne vous reste que 25% du temps de l'activité."),
        })
      }
    }
  }

  private calculatePositions(): void {
    const { navigation } = this.player
    const current = navigation.current
    this.navExerciceCount = navigation.exercises.length

    this.hasNext = undefined
    this.hasPrev = undefined
    if (current && this.player.settings?.navigation?.mode === 'manual') {
      const index = navigation.exercises.findIndex((item) => item.sessionId === current.sessionId)
      this.hasNext = index < navigation.exercises.length - 1
      this.hasPrev = index > 0
      this.position = index
    }
  }

  private calculateAnswerStates(navigation: PlayerNavigation): void {
    this.answerStates = navigation.exercises.reduce((acc, exercise) => {
      acc[exercise.sessionId] = exercise.state
      return acc
    }, {} as Record<string, AnswerStates>)
  }

  private onKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x'].includes(event.key)) {
      this.dialogService.warning(`La fonctionnalité de copier/coller/couper est désactivée pour cette activité.`)
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  private onContextMenu(event: MouseEvent) {
    this.dialogService.warning(`La fonctionnalité de copier/coller/couper est désactivée pour cette activité.`)
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  private onLoseTabFocus(): void {
    if (!this.isPlaying || !this.player.settings?.security?.terminateOnLoseFocus) return

    this.terminatedAfterLoseFocus = true
    this.terminate().catch(console.error)
  }

  private onVisibilityChange(): void {
    if (!this.isPlaying || !this.player.settings?.security?.terminateOnLeavePage) return

    // passed from hidden to visible
    if (document.visibilityState === 'hidden') {
      this.terminatedAfterLeavePage = true
      this.terminate().catch(console.error)
    }
  }

  private enableCopyPasteIfNeeded(): void {
    if (!this.player.settings?.security?.noCopyPaste) return

    const container = this.elementRef.nativeElement
    container.classList.remove(NO_COPY_PASTER_CLASS_NAME)
    container.removeEventListener('keydown', this.onKeydownFn)
    container.removeEventListener('contextmenu', this.onContextMenuFn)
  }

  private disableCopyPasteIfNeeded(): void {
    if (!this.player.settings?.security?.noCopyPaste) return

    const container = this.elementRef.nativeElement
    container.classList.add(NO_COPY_PASTER_CLASS_NAME)
    container.addEventListener('keydown', this.onKeydownFn)
    container.addEventListener('contextmenu', this.onContextMenuFn)
  }

  private startWatchingVisibilityChange(): void {
    window.addEventListener('blur', this.onLoseTabFocusFn)
    document.addEventListener('visibilitychange', this.onVisibilityChangeFn)
  }

  private stopWatchingVisibilityChange(): void {
    window.removeEventListener('blur', this.onLoseTabFocusFn)
    document.removeEventListener('visibilitychange', this.onVisibilityChangeFn)
  }
}
