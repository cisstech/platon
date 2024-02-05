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
  ResourceFiltersComponent,
  ResourceItemComponent,
  ResourceListComponent,
  ResourceOrderingFilterIndicator,
  ResourcePipesModule,
  ResourceService,
  ResourceStatusFilterIndicator,
  ResourceTypeFilterIndicator,
  TopicFilterIndicator,
} from '@platon/feature/resource/browser'
import {
  CircleTree,
  flattenCircleTree,
  Resource,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { NzDividerModule } from 'ng-zorro-antd/divider'

const PAGINATION_LIMIT = 15

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

  private user?: User

  protected tree?: CircleTree
  protected circles: CircleTree[] = []
  protected topics: Topic[] = []
  protected levels: Level[] = []

  protected completion = this.resourceService.completion().pipe(shareReplay(1))
  protected indicators: FilterIndicator<ResourceFilters>[] = [
    ...Object.values(ResourceTypes).map(ResourceTypeFilterIndicator),
    ...Object.values(ResourceStatus).map(ResourceStatusFilterIndicator),
    ...Object.values(ResourceOrderings).map(ResourceOrderingFilterIndicator),
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

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User

    const [tree, circle, views, topics, levels] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(this.user.username)),
      firstValueFrom(this.resourceService.search({ views: true, expands: ['metadata', 'statistic'] })),
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
    ])

    this.tree = tree
    this.circle = circle
    this.topics = topics
    this.levels = levels
    this.views = views.resources

    this.circles = []

    this.indicators = [...topics.map(TopicFilterIndicator), ...levels.map(LevelFilterIndicator), ...this.indicators]

    if (this.tree) {
      this.circles = flattenCircleTree(this.tree)
      this.indicators = [...flattenCircleTree(tree).map((circle) => CircleFilterIndicator(circle)), ...this.indicators]
    }

    this.changeDetectorRef.markForCheck()

    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(async (e: QueryParams) => {
        this.filters = {
          ...this.filters,
          search: e.q,
          parents: e.parents ? (typeof e.parents === 'string' ? [e.parents] : e.parents) : undefined,
          topics: e.topics ? (typeof e.topics === 'string' ? [e.topics] : e.topics) : undefined,
          levels: e.levels ? (typeof e.levels === 'string' ? [e.levels] : e.levels) : undefined,
          period: Number.parseInt(e.period + '', 10) || 0,
          order: e.order,
          direction: e.direction,
          types: typeof e.types === 'string' ? [e.types] : e.types,
          status: typeof e.status === 'string' ? [e.status] : e.status,
          configurable: e.configurable === 'true',
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
            expands: ['metadata', 'statistic'],
            limit: PAGINATION_LIMIT,
          })
        )

        this.items = response.resources
        this.hasMore = response.resources.length > 0
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
      q: query,
      period: filters.period,
      order: filters.order,
      direction: filters.direction,
      types: filters.types,
      status: filters.status,
      parents: filters.parents,
      topics: filters.topics,
      levels: filters.levels,
      configurable: filters.configurable ? true : undefined,
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
        expands: ['metadata'],
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
  configurable?: string | boolean
}
