/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { AuthService, TagService } from '@platon/core/browser'
import { Level, OrderingDirections, Topic, User, uniquifyBy } from '@platon/core/common'
import { ActivityExercise, ActivityVariables } from '@platon/feature/compiler'
import {
  CircleFilterIndicator,
  ExerciseConfigurableFilterIndicator,
  LevelFilterIndicator,
  ResourceDependOnFilterIndicator,
  ResourceOrderingFilterIndicator,
  ResourceService,
  ResourceStatusFilterIndicator,
  ResourceTypeFilterIndicator,
  TopicFilterIndicator,
} from '@platon/feature/resource/browser'
import {
  CircleTree,
  Resource,
  ResourceExpandableFields,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
  flattenCircleTree,
} from '@platon/feature/resource/common'
import { FilterIndicator, PeriodFilterMatcher, SearchBar } from '@platon/shared/ui'
import Fuse from 'fuse.js'
import { Subscription, debounceTime, firstValueFrom, map, shareReplay, skip } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'

const PAGINATION_LIMIT = 15
const EXPANDS: ResourceExpandableFields[] = ['metadata', 'statistic']

interface QueryParams {
  q?: string
  period?: string | number
  order?: ResourceOrderings
  direction?: OrderingDirections
  types?: keyof typeof ResourceTypes | (keyof typeof ResourceTypes)[]
  status?: keyof typeof ResourceStatus | (keyof typeof ResourceStatus)[]
  parents?: string | string[]
  topics?: string | string[]
  levels?: string | string[]
  dependOn?: string | string[]
  configurable?: string | boolean
}

@Component({
  selector: 'app-pla-editor',
  templateUrl: './pla-editor.component.html',
  styleUrls: ['./pla-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaEditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly fileService = inject(FileService)
  private readonly authService = inject(AuthService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly resourceService = inject(ResourceService)
  private readonly tagService = inject(TagService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected readonly searchbar: SearchBar<string> = {
    placeholder: 'Essayez un nom, un topic, un niveau...',
    filterer: {
      run: (query) => {
        return this.completion.pipe(
          map((completion) => {
            const suggestions = new Set<string>([...completion.names, ...completion.topics, ...completion.levels])
            return new Fuse(Array.from(suggestions), {
              includeMatches: true,
              findAllMatches: false,
              threshold: 0.4,
            })
              .search(query)
              .map((e) => e.item)
          })
        )
      },
    },
    onSearch: (query) => this.search(this.filters, query),
  }

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
        retry: 1,
        hints: true,
        reroll: true,
        theories: true,
        solution: true,
      },
      feedback: {
        review: true,
        validation: true,
      },
      seedPerExercise: false,
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
    seedPerExercise: [!!this.activity.settings?.seedPerExercise],
    navigation: this.fb.group({
      mode: [this.activity.settings?.navigation?.mode || 'composed', [Validators.required]],
    }),
    actions: this.fb.group({
      retry: [this.activity?.settings?.actions?.retry, [Validators.required, Validators.min(0)]],
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
  protected selectedExercise: ActivityExercise | Resource | undefined
  protected user!: User

  protected tree?: CircleTree
  protected circles: CircleTree[] = []
  protected topics: Topic[] = []
  protected levels: Level[] = []
  protected totalMatches = 0
  protected completion = this.resourceService.completion().pipe(shareReplay(1))
  protected filterIndicators: FilterIndicator<ResourceFilters>[] = [
    ...Object.values(ResourceTypes).map(ResourceTypeFilterIndicator),
    ...Object.values(ResourceStatus).map(ResourceStatusFilterIndicator),
    ...Object.values(ResourceOrderings).map(ResourceOrderingFilterIndicator),
    ResourceDependOnFilterIndicator(),
    ExerciseConfigurableFilterIndicator,
    PeriodFilterMatcher,
  ]

  protected hasMore = true
  protected searching = true
  protected paginating = false

  protected filters: ResourceFilters = { types: ['EXERCISE'] }
  protected circle!: Resource
  protected items: Resource[] = []
  protected views: Resource[] = []
  protected allConnectedTo: string[] = []
  protected connectedTo: string[][] = [[]]

  /*
    This function update an array of ids that are used to connect the lists for drag&drop shenanigagns
  */
  updateConnectedTo(): void {
    this.allConnectedTo = this.exerciseGroups
      .map(() => {
        return [...this.exerciseGroups.map((_, i) => `array${i}`), ...this.exerciseGroups.map((_, j) => `panel${j}`)]
      })
      .flat()

    this.connectedTo = this.exerciseGroups.map((_, index) => {
      return [
        ...this.exerciseGroups.map((_, i) => `array${i}`),
        ...this.exerciseGroups.map((_, j) => (index === j ? '' : `panel${j}`)).filter((e) => e.length > 0),
      ]
    })
  }

  private isActivityExercise(resource: any): boolean {
    return resource.resource === undefined
  }

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User

    const [tree, circle, views, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(this.user.username)),
      firstValueFrom(this.resourceService.search({ views: true, expands: EXPANDS })),
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
    ])

    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor().catch(console.error)
      })
    )

    this.subscriptions.push(
      this.form.valueChanges.pipe(skip(1), debounceTime(300)).subscribe(this.onChangeData.bind(this))
    )

    this.tree = tree
    this.circle = circle
    this.topics = topics
    this.levels = levels
    this.views = views.resources

    this.circles = []

    this.filterIndicators = [
      ...topics.map(TopicFilterIndicator),
      ...levels.map(LevelFilterIndicator),
      ...this.filterIndicators,
    ]

    if (this.tree) {
      this.circles = flattenCircleTree(this.tree)
      this.filterIndicators = [
        ...flattenCircleTree(tree).map((circle) => CircleFilterIndicator(circle)),
        ...this.filterIndicators,
      ]
    }

    this.changeDetectorRef.markForCheck()

    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(async (e: QueryParams) => {
        this.filters = {
          ...this.filters,
          search: typeof e.q === 'string' ? (e.q.length > 0 ? e.q : undefined) : undefined,
          parents: e.parents ? (typeof e.parents === 'string' ? [e.parents] : e.parents) : undefined,
          topics: e.topics ? (typeof e.topics === 'string' ? [e.topics] : e.topics) : undefined,
          levels: e.levels ? (typeof e.levels === 'string' ? [e.levels] : e.levels) : undefined,
          period: Number.parseInt(e.period + '', 10) || undefined,
          order: e.order,
          direction: e.direction,
          types: typeof e.types === 'string' ? [e.types] : e.types,
          status: typeof e.status === 'string' ? [e.status] : e.status,
          dependOn: typeof e.dependOn === 'string' ? [e.dependOn] : e.dependOn,
          configurable: e.configurable === 'true' || undefined, // do not pass false to prevent ignoring configurable resources by default
        }

        if (this.searchbar.value !== e.q) {
          this.searchbar.value = e.q
        }

        this.searching = true

        this.items = []
        this.hasMore = true
        this.paginating = false

        const response = await firstValueFrom(
          this.resourceService.search({
            ...this.filters,
            expands: EXPANDS,
            limit: PAGINATION_LIMIT,
            types: ['EXERCISE'],
          })
        )

        this.items = response.resources
        this.hasMore = response.resources.length > 0
        this.totalMatches = response.total
        this.searching = false

        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected getToStep(step: number): void {
    this.step = step
    if (step === 2) {
      this.exerciseGroups.length === 0 ? this.addGroup() : this.selectGroup(0)
      this.updateConnectedTo()
    }
  }

  protected handleExerciseClicked(exercise: Resource): void {
    this.selectedExercise = exercise
    this.addExercise()
  }

  protected search(filters: ResourceFilters, query?: string) {
    const queryParams: QueryParams = {
      q: query?.length || 0 ? query : undefined,
      period: filters.period,
      order: filters.order,
      direction: filters.direction,
      types: filters.types,
      status: filters.status,
      parents: filters.parents,
      topics: filters.topics,
      levels: filters.levels,
      configurable: filters.configurable ? true : undefined,
      dependOn: filters.dependOn,
    }

    this.router
      .navigate([], {
        queryParams,
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      })
      .catch(console.error)
  }

  protected async loadMore(): Promise<void> {
    if (this.paginating) {
      return
    }

    this.paginating = true
    const response = await firstValueFrom(
      this.resourceService.search({
        ...this.filters,
        expands: EXPANDS,
        limit: PAGINATION_LIMIT,
        offset: this.items.length + 3,
      })
    )

    const length = this.items.length
    this.items = uniquifyBy([...this.items, ...response.resources], 'id')
    this.hasMore = this.items.length > length
    this.paginating = false

    this.changeDetectorRef.markForCheck()
  }

  protected selectGroup(index: number): void {
    this.selectedGroup = this.exerciseGroups[index]
    this.selectedGroupIndex = index
  }

  protected addGroup(): void {
    const newGroup: ActivityExercise[] = []
    this.exerciseGroups = [...this.exerciseGroups, newGroup]
    this.selectGroup(this.exerciseGroups.length - 1)
    this.updateConnectedTo()
    this.onChangeData()
  }

  protected deleteGroup(index: number): void {
    this.exerciseGroups = this.exerciseGroups.filter((_, i) => i !== index)
    this.selectedGroup = undefined
    this.selectedGroupIndex = undefined
    this.updateConnectedTo()
    this.onChangeData()
  }

  protected addExercise(index?: number): void {
    if (this.selectedGroup && this.selectedExercise) {
      if (index === undefined) {
        this.selectedGroup = [
          ...this.selectedGroup,
          {
            id: uuidv4(),
            version: 'latest',
            resource: this.selectedExercise.id,
          } as ActivityExercise,
        ]
      } else {
        this.selectedGroup = [
          ...this.selectedGroup.slice(0, index),
          {
            id: uuidv4(),
            version: 'latest',
            resource: this.isActivityExercise(this.selectedExercise)
              ? this.selectedExercise.id
              : (this.selectedExercise as ActivityExercise).resource,
          } as ActivityExercise,
          ...this.selectedGroup.slice(index),
        ]
      }
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
    if (this.readOnly || event.previousContainer.id === 'itemList') return
    this.selectGroup(parseInt(event.container.id.substring(5)))
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
        seedPerExercise: value.seedPerExercise || false,
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
      seedPerExercise: this.activity.settings?.seedPerExercise,
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

  drop(event: CdkDragDrop<Resource[]>) {
    if (parseInt(event.previousContainer.id.substring(5)) !== parseInt(event.container.id.substring(5))) {
      this.selectGroup(parseInt(event.container.id.substring(5)))
      this.selectedExercise = event.previousContainer.data[event.previousIndex] as Resource
      this.addExercise(event.currentIndex)
    }
  }
}
