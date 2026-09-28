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
  signal,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core'
import { firstValueFrom, Subscription } from 'rxjs'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'

import {
  type ActivityPlayer,
  ExercisePlayer,
  getClosingTime,
  isTimeouted,
  NO_COPY_PASTER_CLASS_NAME,
  Player,
  PlayerExercise,
  PlayerNavigation,
  PlatonLog,
} from '@platon/feature/player/common'

import { DialogModule, DialogService } from '@platon/core/browser'
import {
  ActivityClosedNotification,
  ActivityOpenStates,
  ModerationActivityChangesNotification,
} from '@platon/feature/course/common'

import { MatIconModule } from '@angular/material/icon'
import { NzSpinModule } from 'ng-zorro-antd/spin'
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
import { PlayerTerminalLogsComponent } from '../player-terminal-logs/player-terminal-logs.component'
import { NotificationService } from '@platon/feature/notification/browser'
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { HttpErrorResponse } from '@angular/common/http'
import { UI_MODAL_IFRAME_CLOSE } from '@platon/shared/ui'
import { SixcodeComponent } from '@platon/shared/ui'
import { NzNotificationComponent } from 'ng-zorro-antd/notification'
import { ObserveVisibilityDirective } from '@platon/shared/ui'

@Component({
  selector: 'player-activity',
  templateUrl: './player-activity.component.html',
  styleUrls: ['./player-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzSpinModule,
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
    DialogModule,
    NgeMarkdownModule,
    SixcodeComponent,
    PlayerResultsComponent,
    PlayerExerciseComponent,
    PlayerSettingsComponent,
    PlayerNavigationComponent,
    PlayerTerminalLogsComponent,
    ObserveVisibilityDirective
  ],
})
export class PlayerActivityComponent implements OnInit, OnDestroy {
  private readonly nzModalService = inject(NzModalService)

  private readonly elementRef = inject(ElementRef) as ElementRef<HTMLElement>
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly dialogService = inject(DialogService)
  private readonly playerService = inject(PlayerService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly notificationService = inject(NotificationService)

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
  protected readonly showLeaveWarning = signal(false)
  protected onLoseTabFocusFn = this.onLoseTabFocus.bind(this)
  protected onVisibilityChangeFn = this.onVisibilityChange.bind(this)
  private readonly onBeforeUnloadFn = this.onBeforeUnload.bind(this)
  private readonly onDocumentPointerLeaveFn = this.onDocumentPointerLeave.bind(this)
  private readonly onDocumentPointerEnterFn = this.onDocumentPointerEnter.bind(this)
  protected onKeydownFn = this.onKeydown.bind(this)
  protected onContextMenuFn = this.onContextMenu.bind(this)
  protected loadingNext = false
  protected isLoading = false
  protected isLoadingNextExercise = false
  protected activityLogs: PlatonLog[] = []
  protected code = ''
  protected isCodeError = false
  private INITIAL_EXERCISES_TO_LOAD = 2

  @ViewChild('errorTemplate', { read: TemplateRef, static: true })
  protected errorTemplate!: TemplateRef<{ $implicit: NzNotificationComponent; data: any }>

  @Input() player!: ActivityPlayer

  protected get composed(): boolean {
    return this.player.settings?.navigation?.mode === 'composed'
  }

  protected get manual(): boolean {
    return this.player.settings?.navigation?.mode === 'manual'
  }

  protected get peerComparison(): boolean {
    return this.player.settings?.navigation?.mode === 'peer'
  }

  protected get nextNavigation(): boolean {
    return this.player.settings?.navigation?.mode === 'next' || this.player.settings?.navigation?.mode === 'validation'
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
  private countdownInterval: NodeJS.Timeout | undefined
  private autoChoiceTimeout: NodeJS.Timeout | undefined
  private notificationSeen: Set<string> = new Set()

  @ViewChild('modalFooter', { static: true }) modalFooter!: TemplateRef<object>

  @ViewChildren('playerExercise') playerExerciseComponents!: QueryList<PlayerExerciseComponent>

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
        if (this.player.settings?.security?.terminateOnLeavePage) {
          // happens when the user opens the activity twice or closed the tab and comes back
          this.terminatedAfterLeavePage = true
          this.terminate().catch(console.error)
          return
        }
        this.start().catch(console.error)
      }
    } else if (this.state === 'planned') {
      const delta = new Date(this.player.openAt as Date).getTime() - new Date(this.player.serverTime).getTime()
      this.countdown = Date.now() + delta
    }

    this.subscriptions.push(
      this.notificationService.paginate(1).subscribe(async ({ notifications }) => {
        if (notifications.length === 0) return

        const notification = notifications[0]
        const notificationData = notification.data

        if ((notificationData as ActivityClosedNotification).type === 'ACTIVITY-CLOSED') {
          const activityClosedData = notificationData as ActivityClosedNotification
          if (activityClosedData.activityId === this.player.activityId) {
            this.state = 'closed'
            await firstValueFrom(this.notificationService.deleteNotification(notification.id))
            await this.terminateModal(false, "L'activité a été fermée par l'enseignant.")
          }
        } else if (
          (notificationData as ModerationActivityChangesNotification).type === 'MODERATION-ACTIVITY-CHANGES' &&
          !this.notificationSeen.has(notification.id)
        ) {
          this.notificationSeen.add(notification.id)
          const moderationData = notificationData as ModerationActivityChangesNotification
          const activity = moderationData.activity as ActivityPlayer

          if (activity.sessionId !== this.player.sessionId) {
            await firstValueFrom(this.notificationService.deleteNotification(notification.id))
            return
          }

          this.player = { ...this.player, ...activity }

          if (this.player.navigation.terminated) {
            this.terminate().catch(console.error)
          } else {
            this.start().catch(console.error)
          }

          await firstValueFrom(this.notificationService.deleteNotification(notification.id))
          this.changeDetectorRef.markForCheck()
        }
      })
    )
  }

  private async evaluateAll(): Promise<void> {
    for (const component of this.playerExerciseComponents) {
      await component.evaluateFromActivity()
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown()
    this.enableCopyPasteIfNeeded()
    this.stopWatchingVisibilityChange()
  }

  protected async start(): Promise<void> {
    this.isLoading = true
    if (this.composed) {
      await this.playComposed()
    } else {
      const { navigation } = this.player
      await this.play(navigation.current || navigation.exercises[0])
    }
    this.isLoading = false
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
    this.showLeaveWarning.set(false)
    this.countdownBreakpoints = []

    const output = await firstValueFrom(this.playerService.terminate(this.player.sessionId))
    this.player = output.activity
    this.exercises = undefined

    this.enableCopyPasteIfNeeded()
    this.stopWatchingVisibilityChange()

    this.changeDetectorRef.markForCheck()
  }

  protected async open(code: string): Promise<void> {
    try {
      const output = await firstValueFrom(this.playerService.openSessionWithCode(this.player.sessionId, code))
      this.player = output.activity
      await this.start()
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        this.dialogService.error("Vous n'êtes pas autorisé à ouvrir cette session.")
        this.isCodeError = true
        setTimeout(() => {
          this.isCodeError = false
        }, 2000)
      } else if (error instanceof Error) {
        this.dialogService.error("Une erreur est survenue lors de l'ouverture de la session.")
      }
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async onCodeComplete(code: string): Promise<void> {
    await this.open(code)
  }

  private saveAnswersToSessionStorage(): void {
    if (!this.playerExerciseComponents) {
      return
    }
    this.playerExerciseComponents.forEach((component) => {
      const componentAnswers = component.getAnswers()
      for (const key in componentAnswers) {
        sessionStorage.setItem('component-' + key, JSON.stringify(componentAnswers[key]))
      }
    })
  }

  protected async play(exercise: PlayerExercise, isPrevArrow = false) {
    if (this.composed) {
      this.jumpToExercise(exercise)
      return
    }

    if (this.manual && this.player.navigation.current && this.player.navigation.current.sessionId) {
      this.saveAnswersToSessionStorage()
    }

    let modifiedNextExercisesHistoryPosition = undefined
    if (this.nextNavigation) {
      if (this.loadingNext) {
        return
      }
      if (isPrevArrow) {
        modifiedNextExercisesHistoryPosition = this.navigation.nextExercisesHistoryPosition - 1
        const prevExerciseId = this.navigation.nextExercisesHistory[modifiedNextExercisesHistoryPosition]
        exercise = this.navigation.exercises.find((item) => item.id === prevExerciseId) as PlayerExercise
      } else if (this.navigation.nextExercisesHistoryPosition != this.navigation.nextExercisesHistory?.length - 1) {
        modifiedNextExercisesHistoryPosition = this.navigation.nextExercisesHistoryPosition + 1
        const nextExerciseId = this.navigation.nextExercisesHistory[modifiedNextExercisesHistoryPosition]
        exercise = this.navigation.exercises.find((item) => item.id === nextExerciseId) as PlayerExercise
      } else {
        try {
          const nextExercise = await firstValueFrom(
            this.playerService.next({
              activitySessionId: this.player.sessionId,
              exerciseSessionIds: [],
            })
          )
          this.activityLogs = nextExercise.logs ?? []
          const nextExerciseId = nextExercise.nextExerciseId
          this.navigation.exercises = nextExercise.navigation.exercises
          if (nextExercise.navigation.terminated) {
            this.terminate().catch(console.error)
            return
          }
          exercise = this.navigation.exercises.find((item) => item.id === nextExerciseId) as PlayerExercise
          if (!exercise) {
            this.dialogService.error("L'exercice suivant n'a pas été trouvé.")
            this.changeDetectorRef.markForCheck()
            return
          }
        } catch (error) {
          let message = 'Une erreur est survenue lors de cette action.'
          if (error instanceof HttpErrorResponse) {
            message = error.error?.message || error.message || message
          }
          this.dialogService.notification(this.errorTemplate, { duration: 0, data: { message } })
          return
        }
      }
    }

    this.exercises = undefined

    try {
      const output = await firstValueFrom(
        this.playerService.playExercises({
          activitySessionId: this.player.sessionId,
          exerciseSessionIds: [exercise.sessionId],
        })
      )

      if (output.navigation) {
        if (modifiedNextExercisesHistoryPosition != undefined) {
          output.navigation.nextExercisesHistoryPosition = modifiedNextExercisesHistoryPosition
        }
        this.player = { ...this.player, navigation: output.navigation }
      }

      this.exercises = output.exercises
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.dialogService.error(error.error?.message || error.message)
        return
      }
      this.dialogService.error(
        "Une erreur est survenue lors du chargement de l'exercice. Merci de prévenir votre professeur"
      )
    }

    this.calculatePositions()
    this.initializeCountdown()

    this.changeDetectorRef.markForCheck()
  }

  protected async loadNextExercise(): Promise<void> {
    if (!this.composed || this.isLoadingNextExercise || this.exercises?.length === this.player.navigation.exercises.length) return;
    this.isLoadingNextExercise = true;
    this.changeDetectorRef.markForCheck();

    const loadCount = this.exercises?.length ?? 0
    const nextExerciseIndex = this.player.navigation.exercises[loadCount]?.sessionId;
    if (!nextExerciseIndex) {
      this.isLoadingNextExercise = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    const nextExercise = await firstValueFrom(
      this.playerService.playExercises({
        activitySessionId: this.player.sessionId,
        exerciseSessionIds: [nextExerciseIndex],
      })
    );

    if (this.exercises) {
      this.exercises = [...this.exercises, ...nextExercise.exercises];
    }
    else {
      this.exercises = nextExercise.exercises;
    }

    this.isLoadingNextExercise = false;
    this.changeDetectorRef.markForCheck();
  }

  protected async playComposed(): Promise<void> {
    try {
      const output = await firstValueFrom(
        this.playerService.playExercises({
          activitySessionId: this.player.sessionId,
          exerciseSessionIds: this.player.navigation.exercises.slice(0, this.INITIAL_EXERCISES_TO_LOAD).map((item) => item.sessionId),
        })
      )

      this.exercises = output.exercises
      if (output.navigation) {
        this.player.navigation = output.navigation
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.dialogService.error(error.error?.message || error.message)
        return
      }
      this.dialogService.error(
        "Une erreur est survenue lors du chargement de l'exercice. Merci de prévenir votre professeur"
      )
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
    if (
      this.nextNavigation &&
      this.player.settings?.nextSettings?.autoNext &&
      !this.loadingNext &&
      navigation.current?.grade != undefined &&
      navigation.current?.grade >= this.player.settings?.nextSettings?.autoNextGrade
    ) {
      this.loadingNext = true
      const nextExerciseButton = document.getElementById('next-exercise-button')
      setTimeout(() => {
        if (navigation.current) {
          this.loadingNext = false
          this.play(navigation.current).catch(console.error)
        }
      }, 2000)
      nextExerciseButton?.classList.add('fill')
      setTimeout(() => {
        nextExerciseButton?.classList.remove('fill')
      }, 2500)
      return
    }
    if (this.peerComparison && navigation.current) {
      this.play(navigation.current).catch(console.error)
      return
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
    this.player = { ...this.player, startedAt: this.player.startedAt || new Date() }

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
      if (currentTime >= startAt + duration || startAt + duration > currentTime + 1000 * 60 * 60 * 4) {
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
    } else if (current && this.player.settings && this.nextNavigation) {
      const index = navigation.exercises.findIndex((item) => item.sessionId === current.sessionId)
      this.hasNext = true
      this.hasPrev =
        this.player.settings.nextSettings?.allowFreeNavigation && navigation.nextExercisesHistoryPosition > 0
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

  private shouldWarnOnLeave(): boolean {
    return this.isPlaying && !!this.player.settings?.security?.terminateOnLeavePage
  }

  private onVisibilityChange(): void {
    if (!this.shouldWarnOnLeave()) return

    if (document.visibilityState === 'hidden') {
      this.terminatedAfterLeavePage = true
      this.terminate().catch(console.error)
    }
  }

  private onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.shouldWarnOnLeave()) return
    event.preventDefault()
    event.returnValue = ''
  }

  private onDocumentPointerLeave(): void {
    if (!this.shouldWarnOnLeave()) return
    this.showLeaveWarning.set(true)
  }

  private onDocumentPointerEnter(): void {
    this.showLeaveWarning.set(false)
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
    window.addEventListener('beforeunload', this.onBeforeUnloadFn)
    document.addEventListener('visibilitychange', this.onVisibilityChangeFn)
    document.documentElement.addEventListener('pointerleave', this.onDocumentPointerLeaveFn)
    document.documentElement.addEventListener('pointerenter', this.onDocumentPointerEnterFn)
  }

  private stopWatchingVisibilityChange(): void {
    window.removeEventListener('blur', this.onLoseTabFocusFn)
    window.removeEventListener('beforeunload', this.onBeforeUnloadFn)
    document.removeEventListener('visibilitychange', this.onVisibilityChangeFn)
    document.documentElement.removeEventListener('pointerleave', this.onDocumentPointerLeaveFn)
    document.documentElement.removeEventListener('pointerenter', this.onDocumentPointerEnterFn)
  }

  protected back() {
    if (window.self !== window.top) {
      window.parent.postMessage(UI_MODAL_IFRAME_CLOSE, '*')
    } else if (window.history.length > 1) {
      window.history.back()
    } else {
      close()
    }
  }

  protected get editorPreview(): boolean {
    return this.activatedRoute.snapshot.queryParamMap.has(PLAYER_EDITOR_PREVIEW)
  }

  protected canShowTerminalLogs = (): boolean => {
    return this.editorPreview && this.nextNavigation && this.activityLogs.length > 0
  }
}
