import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import Fuse from 'fuse.js'
import { firstValueFrom, map, shareReplay, Subscription } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { ViewportIntersectionDirective } from '@cisstech/nge/directives'

import {
  FilterIndicator,
  PeriodFilterMatcher,
  SearchBar,
  UiFilterIndicatorComponent,
  UiSearchBarComponent,
} from '@platon/shared/ui'

import { AuthService, TagService } from '@platon/core/browser'
import { Level, OrderingDirections, Topic, uniquifyBy, User } from '@platon/core/common'
import {
  CircleFilterIndicator,
  CircleTreeComponent,
  ExerciseConfigurableFilterIndicator,
  LevelFilterIndicator,
  ResourceDependOnFilterIndicator,
  ResourceFiltersComponent,
  ResourceItemComponent,
  ResourceListComponent,
  ResourceOrderingFilterIndicator,
  ResourcePipesModule,
  ResourceService,
  ResourceStatusFilterIndicator,
  ResourceTypeFilterIndicator,
  TopicFilterIndicator,
  AntiTopicFilterIndicator,
} from '@platon/feature/resource/browser'
import {
  CircleTree,
  flattenCircleTree,
  Resource,
  ResourceExpandableFields,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { NzDividerModule } from 'ng-zorro-antd/divider'

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
  antiTopics?: string | string[]
  levels?: string | string[]
  dependOn?: string | string[]
  configurable?: string | boolean
  owners?: string | string[]
}

@Component({
  standalone: true,
  selector: 'app-resources',
  templateUrl: 'resources.page.html',
  styleUrls: ['resources.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatIconModule,

    NzSpinModule,
    NzIconModule,
    NzButtonModule,
    NzPopoverModule,
    NzDividerModule,

    ViewportIntersectionDirective,

    ResourcePipesModule,
    ResourceItemComponent,
    ResourceListComponent,
    ResourceFiltersComponent,

    CircleTreeComponent,
    UiSearchBarComponent,
    UiFilterIndicatorComponent,
  ],
})
export default class ResourcesPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []

  private readonly router = inject(Router)
  private readonly tagService = inject(TagService)
  private readonly authService = inject(AuthService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

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

  private user?: User

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

  protected filters: ResourceFilters = {}
  protected circle!: Resource
  protected items: Resource[] = []
  protected views: Resource[] = []
  protected owners: User[] = []

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User
    const direction = localStorage.getItem('order-direction') as OrderingDirections
    const order = localStorage.getItem('order') as ResourceOrderings
    if (direction && order) {
      this.filters = { ...this.filters, direction, order }
      await this.router.navigate([], {
        queryParams: { direction, order },
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      })
    }

    const [tree, circle, views, topics, levels, owners] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(this.user.username)),
      firstValueFrom(this.resourceService.search({ views: true, expands: EXPANDS })),
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
      firstValueFrom(this.resourceService.listOwners()),
    ])

    this.tree = tree
    this.circle = circle
    this.topics = topics
    this.levels = levels
    this.views = views.resources
    this.owners = owners

    this.circles = []

    this.filterIndicators = [
      ...topics.map(TopicFilterIndicator),
      ...topics.map(AntiTopicFilterIndicator),
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
        if (e.direction && e.order) {
          localStorage.setItem('order', e.order)
          localStorage.setItem('order-direction', e.direction)
        }
        this.filters = {
          ...this.filters,
          search: typeof e.q === 'string' ? (e.q.length > 0 ? e.q : undefined) : undefined,
          parents: e.parents ? (typeof e.parents === 'string' ? [e.parents] : e.parents) : undefined,
          topics: e.topics ? (typeof e.topics === 'string' ? [e.topics] : e.topics) : undefined,
          antiTopics: e.antiTopics ? (typeof e.antiTopics === 'string' ? [e.antiTopics] : e.antiTopics) : undefined,
          levels: e.levels ? (typeof e.levels === 'string' ? [e.levels] : e.levels) : undefined,
          period: Number.parseInt(e.period + '', 10) || undefined,
          order: e.order,
          direction: e.direction,
          types: typeof e.types === 'string' ? [e.types] : e.types,
          status: typeof e.status === 'string' ? [e.status] : e.status,
          dependOn: typeof e.dependOn === 'string' ? [e.dependOn] : e.dependOn,
          configurable: e.configurable === 'true' || undefined, // do not pass false to prevent ignoring configurable resources by default
          owners: e.owners ? (typeof e.owners === 'string' ? [e.owners] : e.owners) : undefined,
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
      antiTopics: filters.antiTopics,
      levels: filters.levels,
      configurable: filters.configurable ? true : undefined,
      dependOn: filters.dependOn,
      owners: filters.owners,
    }

    console.error(JSON.stringify(this.search, null, 2))

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
        offset: this.items.length,
      })
    )

    const length = this.items.length
    this.items = uniquifyBy([...this.items, ...response.resources], 'id')
    this.hasMore = this.items.length > length
    this.paginating = false

    this.changeDetectorRef.markForCheck()
  }

  protected applyTagFilter(id: string, type: 'topic' | 'level') {
    this.search(
      {
        ...this.filters,
        ...(type === 'topic'
          ? { topics: [...(this.filters.topics ?? []), id] }
          : { levels: [...(this.filters.levels ?? []), id] }),
      },
      this.searchbar.value
    )
  }
}
