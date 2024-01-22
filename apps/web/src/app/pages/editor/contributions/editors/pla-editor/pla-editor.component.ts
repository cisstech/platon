/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { AuthService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { ActivityExercise, ActivityVariables } from '@platon/feature/compiler'
import { Resource } from '@platon/feature/resource/common'
import { Subscription, debounceTime, skip } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'

@Component({
  selector: 'app-pla-editor',
  templateUrl: './pla-editor.component.html',
  styleUrls: ['./pla-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaEditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly fileService = inject(FileService)
  private readonly authService = inject(AuthService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private readonly subscriptions: Subscription[] = []
  private request!: OpenRequest

  protected activity: ActivityVariables = {
    title: '',
    introduction: '',
    conclusion: '',
    settings: {
      duration: 0,
      navigation: { mode: 'composed' },
      actions: {
        hints: true,
        reroll: true,
        theories: true,
        solution: true,
      },
      feedback: {
        review: true,
        validation: true,
      },
      security: {
        noCopyPaste: false,
        terminateOnLeavePage: false,
        terminateOnLoseFocus: false,
      },
    },
    exerciseGroups: {},
  }

  protected readOnly?: boolean

  protected step = 0

  @Input()
  protected editor!: Editor

  protected form = this.fb.group({
    title: [this.activity.title, [Validators.required]],
    introduction: [this.activity.introduction, [Validators.required]],
    conclusion: [this.activity.conclusion, [Validators.required]],
    duration: [new Date()],
    navigation: this.fb.group({
      mode: [this.activity.settings?.navigation?.mode || 'composed', [Validators.required]],
    }),
    actions: this.fb.group({
      retry: [1, [Validators.required, Validators.min(0)]],
      hints: [!!this.activity?.settings?.actions?.hints],
      reroll: [!!this.activity?.settings?.actions?.reroll],
      theories: [!!this.activity?.settings?.actions?.theories],
      solution: [!!this.activity?.settings?.actions?.solution],
    }),
    feedback: this.fb.group({
      review: [!!this.activity?.settings?.feedback?.review],
      validation: [!!this.activity?.settings?.feedback?.validation],
    }),
    security: this.fb.group({
      noCopyPaste: [!!this.activity?.settings?.security?.noCopyPaste],
      terminateOnLeavePage: [!!this.activity?.settings?.security?.terminateOnLeavePage],
      terminateOnLoseFocus: [!!this.activity?.settings?.security?.terminateOnLoseFocus],
    }),
  })

  protected exerciseGroups: ActivityExercise[][] = []
  protected selectedGroup: ActivityExercise[] | undefined
  protected selectedGroupIndex: number | undefined
  protected selectedExercise: Resource | undefined

  protected user!: User

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User

    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor()
      })
    )

    this.subscriptions.push(
      this.form.valueChanges.pipe(skip(1), debounceTime(300)).subscribe(this.onChangeData.bind(this))
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected selectGroup(index: number): void {
    this.selectedGroup = this.exerciseGroups[index]
    this.selectedGroupIndex = index
  }

  protected addGroup(): void {
    const newGroup: ActivityExercise[] = []
    this.exerciseGroups = [...this.exerciseGroups, newGroup]
    this.selectGroup(this.exerciseGroups.length - 1)
    this.onChangeData()
  }

  protected deleteGroup(index: number): void {
    this.exerciseGroups = this.exerciseGroups.filter((_, i) => i !== index)
    this.selectedGroup = undefined
    this.selectedGroupIndex = undefined
    this.onChangeData()
  }

  protected addExercise(): void {
    if (this.selectedGroup && this.selectedExercise) {
      this.selectedGroup = [
        ...this.selectedGroup,
        {
          id: uuidv4(),
          version: 'latest',
          resource: this.selectedExercise.id,
        } as ActivityExercise,
      ]
      this.exerciseGroups = this.exerciseGroups.map((group, index) =>
        index === this.selectedGroupIndex ? (this.selectedGroup as ActivityExercise[]) : group
      )
      this.selectedExercise = undefined
    }
    this.onChangeData()
  }

  protected deleteExercise(index: number): void {
    this.selectedGroup = this.selectedGroup?.filter((_, i) => i !== index)
    this.exerciseGroups = this.exerciseGroups.map((group, i) =>
      i === this.selectedGroupIndex ? (this.selectedGroup as ActivityExercise[]) : group
    )

    this.onChangeData()
  }

  protected updateExercise(exercise: ActivityExercise): void {
    this.selectedGroup = this.selectedGroup?.map((e) => (e.id === exercise.id ? exercise : e))
    this.exerciseGroups = this.exerciseGroups.map((group, i) =>
      i === this.selectedGroupIndex ? (this.selectedGroup as ActivityExercise[]) : group
    )
    this.onChangeData()
  }

  protected onReorderGroups(event: CdkDragDrop<ActivityExercise[][]>) {
    if (this.readOnly) return
    moveItemInArray(this.exerciseGroups, event.previousIndex, event.currentIndex)
    this.selectGroup(event.currentIndex)
    this.onChangeData()
  }

  protected onReorderExercises(event: CdkDragDrop<ActivityExercise[]>) {
    if (this.readOnly) return
    moveItemInArray(this.selectedGroup as ActivityExercise[], event.previousIndex, event.currentIndex)
    this.onChangeData()
  }

  protected onChangeData(): void {
    const { value } = this.form

    const time = value.duration

    /*
      time.getHours() returns the hour for the specified date, according to local time. Multiplying this by 3600 converts it to seconds.
      time.getMinutes() returns the minutes in the specified date according to local time. Multiplying this by 60 converts it to seconds.
      time.getSeconds() returns the seconds in the specified date according to local time.
      So, the total duration is the sum of hours, minutes, and seconds, all represented in seconds.
    */
    const duration = time ? time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds() : 0

    this.activity = {
      ...this.activity,
      title: value.title || '',
      introduction: value.introduction || '',
      conclusion: value.conclusion || '',
      settings: {
        ...this.activity.settings,
        duration,
        navigation: {
          mode: value.navigation?.mode || 'composed',
        },
        actions: {
          retry: value.actions?.retry || 0,
          hints: value.actions?.hints || false,
          reroll: value.actions?.reroll || false,
          theories: value.actions?.theories || false,
          solution: value.actions?.solution || false,
        },
        feedback: {
          review: value.feedback?.review || false,
          validation: value.feedback?.validation || false,
        },
        security: {
          noCopyPaste: value.security?.noCopyPaste || false,
          terminateOnLeavePage: value.security?.terminateOnLeavePage || false,
          terminateOnLoseFocus: value.security?.terminateOnLoseFocus || false,
        },
      },
      exerciseGroups: this.exerciseGroups.reduce((acc, group, index) => {
        acc[index] = group
        return acc
      }, {} as Record<number, ActivityExercise[]>),
    }

    this.fileService.update(this.request.uri, JSON.stringify(this.activity, null, 2))

    this.exerciseGroups = Object.values(this.activity.exerciseGroups)

    this.changeDetectorRef.markForCheck()
  }

  protected trackByIndex(index: number) {
    return index
  }

  protected trackByExerciseId(_: number, exercise: ActivityExercise) {
    return exercise.id
  }

  private async createEditor(): Promise<void> {
    const file = this.request.file!
    this.readOnly = file?.readOnly

    const content = await this.fileService.open(this.request.uri)
    this.activity = JSON.parse(content.current) as ActivityVariables

    const duration = this.activity.settings?.duration || 0
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60
    const durationDate = new Date()
    durationDate.setHours(hours, minutes, seconds)

    this.form.patchValue({
      title: this.activity.title,
      introduction: this.activity.introduction,
      conclusion: this.activity.conclusion,
      duration: durationDate,
      navigation: {
        mode: this.activity.settings?.navigation?.mode,
      },
      actions: {
        retry: this.activity?.settings?.actions?.retry,
        hints: this.activity?.settings?.actions?.hints,
        reroll: this.activity?.settings?.actions?.reroll,
        theories: this.activity?.settings?.actions?.theories,
        solution: this.activity?.settings?.actions?.solution,
      },
      feedback: {
        review: this.activity.settings?.feedback?.review,
        validation: this.activity.settings?.feedback?.validation,
      },
      security: {
        noCopyPaste: this.activity.settings?.security?.noCopyPaste,
        terminateOnLeavePage: this.activity.settings?.security?.terminateOnLeavePage,
        terminateOnLoseFocus: this.activity.settings?.security?.terminateOnLoseFocus,
      },
    })

    if (this.readOnly) {
      this.form.disable({ emitEvent: false })
    }

    this.exerciseGroups = Object.values(this.activity.exerciseGroups)

    this.changeDetectorRef.markForCheck()
  }
}
