/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Editor, EditorService, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { AuthService, DialogService, TagService } from '@platon/core/browser'
import { Level, OrderingDirections, Topic, User, uniquifyBy } from '@platon/core/common'
import {
  ACTIVITY_NEXT_FILE_NODE,
  ACTIVITY_NEXT_FILE_PYTHON,
  ActivityExercise,
  ActivityExerciseGroup,
  ActivityVariables,
  GroupGrader,
  normalizeExerciseGroups,
} from '@platon/feature/compiler'
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
import { ResourceFileImpl, ResourceFileSystemProvider } from '../../file-system'
import { HttpClient } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatIconModule } from '@angular/material/icon'
import { MatExpansionModule } from '@angular/material/expansion'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzStepsModule } from 'ng-zorro-antd/steps'
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { CircleTreeComponent, ResourceFiltersComponent, ResourcePipesModule } from '@platon/feature/resource/browser'
import { PleInputEditorModule } from '../ple-input/ple-input.module'
import { PlaExerciseEditorComponent } from './exercise-editor/exercise-editor.component'
import { UiFilterIndicatorComponent, UiSearchBarComponent } from '@platon/shared/ui'
import { ViewportIntersectionDirective } from '@cisstech/nge/directives'
import { ExerciseListComponent } from './exercise-list/exercise-list.component'

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatIconModule,
    DragDropModule,
    MatExpansionModule,

    NzCollapseModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzStepsModule,
    NzFormModule,
    NzCheckboxModule,
    NzTimePickerModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzTooltipModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzTypographyModule,

    ViewportIntersectionDirective,
    NzAlertModule,

    ResourcePipesModule,
    ResourceFiltersComponent,

    CircleTreeComponent,
    UiSearchBarComponent,
    UiFilterIndicatorComponent,

    ExerciseListComponent,

    PleInputEditorModule,
    PlaExerciseEditorComponent,

    NzModalModule,
  ],
})
export class PlaEditorComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient)

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly fileService = inject(FileService)
  private readonly authService = inject(AuthService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly resourceService = inject(ResourceService)
  private readonly tagService = inject(TagService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly dialogService = inject(DialogService)
  private readonly editorService = inject(EditorService)
  private readonly resourceFileSystemProvider = inject(ResourceFileSystemProvider)

  protected readonly searchbar: SearchBar<string> = {
    placeholder: 'Essayez un nom, un topic, un niveau...',
    filterer: {
      run: (query) => {
        return this.completion.pipe(
          map((completion) => {
            const suggestions = new Set<string>([
              query,
              ...completion.names,
              ...completion.topics,
              ...completion.levels,
            ])
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
      navigation: { mode: 'manual', random: false },
      actions: {
        retry: 0,
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
      nextSettings: {
        sandbox: 'python',
        autoNext: false,
        autoNextGrade: 0,
        allowFreeNavigation: true,
        hasExercisesVariables: false,
      },
    },
    activityGrade: 0,
    nextExerciseId: '',
    next: '',
    exerciseGroups: {},
  }

  protected readOnly?: boolean

  protected step = 2

  protected expandedGroups: { [index: number]: boolean } = {} // tracking if the grader is expanded for each group
  @Input()
  protected editor!: Editor

  protected form = this.fb.group({
    title: [this.activity.title, [Validators.required]],
    introduction: [this.activity.introduction, [Validators.required]],
    conclusion: [this.activity.conclusion, [Validators.required]],
    duration: [new Date()],
    seedPerExercise: [!!this.activity.settings?.seedPerExercise],
    navigation: this.fb.group({
      mode: [this.activity.settings?.navigation?.mode || 'manual', [Validators.required]],
      random: [this.activity.settings?.navigation?.random || false],
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
    nextSettings: this.fb.group({
      sandbox: [this.activity.settings?.nextSettings?.sandbox || 'python'],
      autoNext: [this.activity.settings?.nextSettings?.autoNext || false],
      autoNextGrade: [this.activity.settings?.nextSettings?.autoNextGrade || 0],
      allowFreeNavigation: [!!this.activity.settings?.nextSettings?.allowFreeNavigation],
      hasExercisesVariables: [this.activity.settings?.nextSettings?.hasExercisesVariables || false],
    }),
  })

  protected navigationModes = [
    { value: 'manual', label: 'Progressive', tooltip: 'Les exercices sont affichés un à un.' },
    { value: 'composed', label: 'Composée', tooltip: 'Tous les exercices sont affichés simultanément.' },
    {
      value: 'next',
      label: 'Intelligente',
      tooltip: "Les exercices s'enchaineront en fonction du comportement défini dans next.py.",
    },
    {
      value: 'peer',
      label: 'Comparaison par les pairs',
      tooltip: "Mode composé que l'on utilise pour afficher deux exercices et les comparer.",
    },
    {
      value: 'validation',
      label: 'Validation',
      tooltip: "Les groupes permettent de réunir un ensemble d'exercices afin de structurer les étapes de l'activité.",
    },
  ]

  protected exerciseGroups: ActivityExerciseGroup[] = []
  protected selectedGroup: ActivityExerciseGroup | undefined
  protected selectedGroupIndex: number | undefined
  protected selectedExercise: ActivityExercise | Resource | undefined
  protected user!: User

  protected tree!: CircleTree
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

  protected filters: ResourceFilters = {}
  protected circle!: Resource
  protected items: Resource[] = []
  protected allConnectedTo: string[] = []
  protected connectedTo: string[][] = [[]]

  protected peer_activity_groups = ['exercice', 'comparaison', 'entrainement', 'attente']

  // default grader for validation mode
  protected defaultGrader: GroupGrader = {
    type: 'success',
    exerciseCount: 3,
    targetScore: 80,
    maxAttempts: 5,
  }

  protected neverEnter = () => false

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User
    const direction = localStorage.getItem('order-direction') as OrderingDirections
    const order = localStorage.getItem('order') as ResourceOrderings
    if (direction && order) {
      this.filters = { ...this.filters, direction, order }
    }

    const [tree, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
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
    this.form.valueChanges.pipe(skip(1)).subscribe((partial) => {
      if (partial.navigation?.mode === 'peer') {
        this.peer_activity_groups.forEach((group) => {
          this.addGroup(group)
        })
      }
      if (partial.navigation?.mode === 'validation') {
        this.form.get('nextSettings.hasExercisesVariables')?.setValue(true, { emitEvent: false })
        this.exerciseGroups.forEach((group) => {
          if (!group.grader || group.grader.type === 'empty') {
            group.grader = { ...this.defaultGrader }
          }
        })
      }
    })

    this.tree = tree
    this.topics = topics
    this.levels = levels

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
        if (e.order && e.direction) {
          localStorage.setItem('order', e.order)
          localStorage.setItem('order-direction', e.direction)
        }
        this.filters = {
          ...this.filters,
          search: typeof e.q === 'string' ? (e.q.length > 0 ? e.q : undefined) : undefined,
          parents: e.parents ? (typeof e.parents === 'string' ? [e.parents] : e.parents) : undefined,
          topics: e.topics ? (typeof e.topics === 'string' ? [e.topics] : e.topics) : undefined,
          levels: e.levels ? (typeof e.levels === 'string' ? [e.levels] : e.levels) : undefined,
          period: Number.parseInt(e.period + '', 10) || undefined,
          order: e.order,
          direction: e.direction,
          types: [ResourceTypes.EXERCISE],
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

    this.activatedRoute.params.subscribe(async (params) => {
      const resource = await firstValueFrom(this.resourceService.find({ id: params['id'] }))
      const parent = resource.parentId
      this.filters = {
        ...this.filters,
        parents: parent ? [parent] : undefined,
      }
      this.search(this.filters)
      this.changeDetectorRef.markForCheck()
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected getNavigationTooltip(mode: string): string {
    const modeObj = this.navigationModes.find((m) => m.value === mode)
    return modeObj ? modeObj.tooltip : ''
  }

  protected getNavigationLabel(mode: string): string {
    const modeObj = this.navigationModes.find((m) => m.value === mode)
    return modeObj ? modeObj.label : ''
  }

  protected getToStep(step: number): void {
    this.step = step
    if (step === 2) {
      if (this.exerciseGroups.length === 0) {
        this.addGroup()
      } else {
        this.selectGroup(0)
      }
      this.updateConnectedTo()
    }
  }

  /**
    @name updateConnectedTo
    @description
    This function update an array of ids that are used to connect the lists for drag&drop shenanigans
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
    return resource.resource !== undefined
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
        replaceUrl: true,
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
        offset: this.items.length + 2,
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

  protected addGroup(name?: string): void {
    const initialGrader: GroupGrader =
      this.activity?.settings?.navigation?.mode === 'validation' ? { ...this.defaultGrader } : { type: 'empty' }
    if (name) {
      if (this.exerciseGroups.find((group) => group.name === name)) {
        return // prevent adding a group with the same name
      }
      this.exerciseGroups = [
        ...this.exerciseGroups,
        {
          name,
          exercises: [],
          grader: initialGrader,
        },
      ]
    } else {
      const newGroup: ActivityExerciseGroup = {
        name: 'Groupe ' + (this.exerciseGroups.length + 1),
        exercises: [],
        grader: initialGrader,
      }
      this.exerciseGroups = [...this.exerciseGroups, newGroup]
    }
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
        this.selectedGroup.exercises = [
          ...this.selectedGroup.exercises,
          {
            id: uuidv4(),
            version: 'latest',
            resource: this.selectedExercise.id,
            groupId: this.selectedGroupIndex,
          } as ActivityExercise,
        ]
      } else {
        this.selectedGroup.exercises = [
          ...this.selectedGroup.exercises.slice(0, index),
          {
            id: uuidv4(),
            version: 'latest',
            resource: this.isActivityExercise(this.selectedExercise)
              ? (this.selectedExercise as ActivityExercise).resource
              : this.selectedExercise.id,
            groupId: this.selectedGroupIndex,
          } as ActivityExercise,
          ...this.selectedGroup.exercises.slice(index),
        ]
      }
      this.exerciseGroups = this.exerciseGroups.map((group, index) =>
        index === this.selectedGroupIndex
          ? { ...group, exercises: this.selectedGroup?.exercises as ActivityExercise[] }
          : group
      )
      this.selectedExercise = undefined
    }
    this.onChangeData()
  }

  protected deleteExercise(index: number): void {
    this.selectedGroup = {
      name: this.selectedGroup?.name || '',
      exercises: this.selectedGroup?.exercises.filter((_, i) => i !== index) ?? [],
      grader: this.selectedGroup?.grader || { type: 'empty' },
    }
    this.exerciseGroups = this.exerciseGroups.map((group, i) =>
      i === this.selectedGroupIndex
        ? { ...group, exercises: this.selectedGroup?.exercises as ActivityExercise[] }
        : group
    )

    this.onChangeData()
  }

  protected updateExercise(exercise: ActivityExercise): void {
    this.selectedGroup = {
      name: this.selectedGroup?.name || '',
      exercises: this.selectedGroup?.exercises.map((e) => (e.id === exercise.id ? exercise : e)) ?? [],
      grader: this.selectedGroup?.grader || { type: 'empty' },
    }
    this.exerciseGroups = this.exerciseGroups.map((group, i) =>
      i === this.selectedGroupIndex
        ? { ...group, exercises: this.selectedGroup?.exercises as ActivityExercise[] }
        : group
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
    moveItemInArray(this.selectedGroup?.exercises as ActivityExercise[], event.previousIndex, event.currentIndex)
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
          random: value.navigation?.random || false,
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
        nextSettings: {
          sandbox: value.nextSettings?.sandbox || 'python',
          autoNext: value.nextSettings?.autoNext || false,
          autoNextGrade: value.nextSettings?.autoNextGrade || 0,
          allowFreeNavigation: value.nextSettings?.allowFreeNavigation || false,
          hasExercisesVariables:
            // mode validation cannot work without hasExercisesVariables set has true
            value.navigation?.mode === 'validation' ? true : value.nextSettings?.hasExercisesVariables || false,
        },
      },
      exerciseGroups: this.exerciseGroups.reduce((acc, group, index) => {
        acc[index] = {
          // update exercise groupId
          ...group,
          exercises: group.exercises.map((exercise) => ({
            ...exercise,
            groupId: index,
          })),
        }
        return acc
      }, {} as Record<number, ActivityExerciseGroup>),
    }

    this.fileService.update(this.request.uri, JSON.stringify(this.activity, null, 2))

    this.activity.exerciseGroups = normalizeExerciseGroups(this.activity.exerciseGroups)
    this.exerciseGroups = Object.values(this.activity.exerciseGroups)

    this.changeDetectorRef.markForCheck()
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
        random: this.activity.settings?.navigation?.random,
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
      nextSettings: {
        sandbox: this.activity.settings?.nextSettings?.sandbox,
        autoNext: this.activity.settings?.nextSettings?.autoNext,
        autoNextGrade: this.activity.settings?.nextSettings?.autoNextGrade,
        allowFreeNavigation: this.activity.settings?.nextSettings?.allowFreeNavigation,
        hasExercisesVariables:
          this.activity.settings?.navigation?.mode === 'validation'
            ? true // mode validation always need hasExercisesVariables to be true
            : this.activity.settings?.nextSettings?.hasExercisesVariables,
      },
    })

    if (this.readOnly) {
      this.form.disable({ emitEvent: false })
    }

    this.activity.exerciseGroups = normalizeExerciseGroups(this.activity.exerciseGroups)
    this.exerciseGroups = Object.values(this.activity.exerciseGroups)
    this.updateConnectedTo()
    this.changeDetectorRef.markForCheck()
  }

  drop(event: CdkDragDrop<Resource[]>) {
    if (parseInt(event.previousContainer.id.substring(5)) !== parseInt(event.container.id.substring(5))) {
      this.selectGroup(parseInt(event.container.id.substring(5)))
      this.selectedExercise = event.previousContainer.data[event.previousIndex] as Resource
      this.addExercise(event.currentIndex)
      if (event.previousContainer.id.startsWith('array')) {
        event.previousContainer.data.splice(event.previousIndex, 1)
      }
    }
    event.event.stopPropagation()
  }

  onGroupeRename(event: string, index: number) {
    this.selectGroup(index)
    if (this.selectedGroup) {
      this.selectedGroup.name = event.substring(0, 30)
    }
    this.onChangeData()
  }

  /** Update infotmation when switching the grade validation mode for validation type of activity*/
  protected onGraderTypeChange(type: 'empty' | 'mean' | 'success', index: number): void {
    const group = this.exerciseGroups[index]
    if (!group) return

    if (type === 'empty') {
      group.grader = { type: 'empty' }
    } else if (type === 'mean' || type === 'success') {
      group.grader = { ...group.grader, type }
    }
    this.onChangeData()
  }

  onExerciseLoadFailed(failedExercise: ActivityExercise) {
    for (const group of this.exerciseGroups) {
      group.exercises = group.exercises.filter((exercise) => exercise.id !== failedExercise.id)
    }
    this.dialogService.error("Attention, un exercice n'a pas pu être chargé. Il a été retiré de l'activité.")
    this.onChangeData()
  }

  get nbFilters(): number {
    return Object.values(this.filters)
      .filter((e) => e !== undefined)
      .filter((e) => e.length !== 0).length
  }

  protected async openNextFile(): Promise<void> {
    const nextUri = this.resourceFileSystemProvider.buildUri(
      (this.request.file as ResourceFileImpl).resourceFile.resourceId,
      'latest',
      this.activity.settings?.nextSettings?.sandbox == 'python' ? ACTIVITY_NEXT_FILE_PYTHON : ACTIVITY_NEXT_FILE_NODE
    )

    if (!this.resourceFileSystemProvider.exists(nextUri)) {
      let defaultContent = ''

      if (this.activity.settings?.navigation?.mode === 'validation') {
        try {
          defaultContent = await firstValueFrom(
            this.http.get('assets/templates/validation.py', { responseType: 'text' })
          )
        } catch (error) {
          console.error("cannon't load the template of validation", error)
          defaultContent = '# Erreur de chargement du template du next nécessaire pour le mode validation.\n'
        }
      }

      await this.resourceFileSystemProvider.write(nextUri, defaultContent, false)
    }

    this.editorService.open(nextUri).catch(console.log)
  }
}
