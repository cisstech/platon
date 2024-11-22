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
import { HttpErrorResponse } from '@angular/common/http'

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
  protected answers: ExercisePlayer[] = []
  protected navExerciceCount = 0
  protected terminatedAfterLoseFocus = false
  protected terminatedAfterLeavePage = false
  protected onLoseTabFocusFn = this.onLoseTabFocus.bind(this)
  protected onVisibilityChangeFn = this.onVisibilityChange.bind(this)
  protected onKeydownFn = this.onKeydown.bind(this)
  protected onContextMenuFn = this.onContextMenu.bind(this)
  protected loadingNext = false

  @ViewChild('errorTemplate', { read: TemplateRef, static: true })
  protected errorTemplate!: TemplateRef<object>

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
    return this.player.settings?.navigation?.mode === 'next'
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
    if (this.composed) {
      await this.playAll()
    } else {
      const { navigation } = this.player
      await this.play(navigation.current || navigation.exercises[0])
    }
    this.playIfNeed(this.navigation).catch(console.error)
    this.extractAnswers()
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

  private saveAnswersToSessionStorage(): void {
    this.playerExerciseComponents.forEach((component) => {
      const componentAnswers = component.getAnswers()
      for (const key in componentAnswers) {
        sessionStorage.setItem('component-' + key, JSON.stringify(componentAnswers[key]))
      }
    })
  }

  protected async play(exercise: PlayerExercise) {
    if (this.composed) {
      this.jumpToExercise(exercise)
      return
    }

    if (this.manual && this.player.navigation.current && this.player.navigation.current.sessionId) {
      this.saveAnswersToSessionStorage()
    }

    if (this.nextNavigation) {
      if (this.loadingNext) {
        return
      }
      try {
        const nextExercise = await firstValueFrom(
          this.playerService.next({
            activitySessionId: this.player.sessionId,
            exerciseSessionIds: [],
          })
        )
        const nextExerciseId = nextExercise.nextExerciseId
        const terminated = nextExercise.terminated
        if (terminated) {
          this.terminate().catch(console.error)
          return
        }
        exercise = this.navigation.exercises.find((item) => item.id === nextExerciseId) as PlayerExercise
        if (!exercise) {
          this.dialogService.error("L'exercice suivant n'a pas été trouvé.")
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

    this.exercises = undefined

    try {
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
    } catch (error) {
      this.dialogService.error(
        "Une erreur est survenue lors du chargement de l'exercice. Merci de prévenir votre professeur"
      )
    }

    this.calculatePositions()
    this.initializeCountdown()

    this.changeDetectorRef.markForCheck()
  }

  protected async playAll(): Promise<void> {
    try {
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
    } catch (error) {
      this.dialogService.error(
        "Une erreur est survenue lors du chargement de l'exercice. Merci de prévenir votre professeur"
      )
    }

    this.calculatePositions()
    this.initializeCountdown()
    this.changeDetectorRef.markForCheck()
  }

  private extractAnswers(): void {
    const peerNav = this.player.navigation.exercises.filter((item) => item.peerComparison).map((item) => item.sessionId)
    this.answers =
      this.exercises?.filter(
        (item) => item.reviewMode || (item as any).peerComparison || peerNav.includes(item.sessionId)
      ) ?? []
    this.exercises = this.exercises?.filter((item) => !item.reviewMode && !peerNav.includes(item.sessionId))
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
    // if (this.showSucceededPopup && navigation.exercises.every((exercise) => exercise.state === 'SUCCEEDED')) {
    //   this.showSucceededPopup = false
    //   this.dialogService
    //     .confirm({
    //       nzTitle: `Vous avez complété tous les exercices avec succès.`,
    //       nzContent: `Voulez-vous terminer l'activité ? \nAprès avoir terminé l'activité, vous ne pourrez plus modifier vos réponses.`,
    //       nzOkText: 'Terminer',
    //       nzOkDanger: true,
    //       nzCancelText: 'Annuler',
    //     })
    //     .then((confirmed) => {
    //       if (confirmed) {
    //         this.terminate().catch(console.error)
    //       }
    //     })
    //     .catch(console.error)
    // }
    if (
      this.player.settings?.navigation?.mode === 'next' &&
      this.player.settings?.nextSettings?.autoNext &&
      !this.loadingNext &&
      navigation.current?.grade &&
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
    this.player = { ...this.player, navigation }
    this.playIfNeed(navigation).catch(console.error)
    this.calculatePositions()
    this.calculateAnswerStates(navigation)
  }

  private async playIfNeed(navigation: PlayerNavigation): Promise<void> {
    if (!this.peerComparison) {
      return
    }
    this.answers = this.answers.filter((item) =>
      navigation.exercises.find((exercise) => exercise.sessionId === item.sessionId)
    )

    for (const exercise of navigation.exercises) {
      if (
        !(this.exercises?.map((item) => item.sessionId) ?? []).includes(exercise.sessionId) &&
        exercise.peerComparison
      ) {
        const output = this.playerService.get(exercise.sessionId)
        const { exercises } = await firstValueFrom(output)

        this.answers = this.answers.concat(exercises)
        // this.exercises = this.exercises?.concat(exercises)
      }
    }
    this.changeDetectorRef.markForCheck()

    if (navigation.current) {
      await this.play(navigation.current)
    }
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
    } else if (current && this.player.settings?.navigation?.mode === 'next') {
      const index = navigation.exercises.findIndex((item) => item.sessionId === current.sessionId)
      this.hasNext = true
      this.hasPrev = false
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
