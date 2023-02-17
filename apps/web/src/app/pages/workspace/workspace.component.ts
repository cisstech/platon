/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { SearchBar, UiSearchBarComponent } from '@platon/shared/ui';

import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { AuthService } from '@platon/core/browser';
import { OrderingDirections, User } from '@platon/core/common';
import { ResourceItemComponent, ResourceListComponent, ResourcePipesModule, ResourceService, RESOURCE_ORDERING_NAMES, RESOURCE_STATUS_NAMES, RESOURCE_TYPE_NAMES } from '@platon/feature/resource/browser';
import { circleFromTree, CircleTree, flattenCircleTree, Resource, ResourceFilters, ResourceOrderings, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common';
import Fuse from 'fuse.js';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { firstValueFrom, map, shareReplay, Subscription } from 'rxjs';
import { FiltersComponent } from './filters/filters.component';

@Component({
  standalone: true,
  selector: 'app-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: ['workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,

    NzSpinModule,
    NzIconModule,
    NzButtonModule,
    NzDrawerModule,
    NzPopoverModule,

    ResourcePipesModule,
    ResourceItemComponent,
    ResourceListComponent,

    FiltersComponent,
    UiSearchBarComponent,
  ]
})

export default class WorkspaceComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly filterMatchers: FilterMatcher[] = [
    ...Object.values(ResourceTypes)
      .map(type => ((filters: ResourceFilters) => filters.types?.includes(type)
        ? { label: RESOURCE_TYPE_NAMES[type], remove: (filters: ResourceFilters) => ({ ...filters, types: filters.types?.filter(e => e !== type) }) }
        : undefined
      )),

    ...Object.values(ResourceStatus)
      .map(status => ((filters: ResourceFilters) => filters.status?.includes(status)
        ? { label: RESOURCE_STATUS_NAMES[status], remove: (filters: ResourceFilters) => ({ ...filters, status: filters.status?.filter(e => e !== status) }) }
        : undefined
      )),

    ...Object.values(ResourceOrderings)
      .map(order => ((filters: ResourceFilters) => filters.order === order
        ? { label: 'Trier par ' + RESOURCE_ORDERING_NAMES[order], remove: (filters: ResourceFilters) => ({ ...filters, order: undefined }) }
        : undefined
      )),

    (filters) => filters.period !== 0
      ? { label: `Modifié il y a au moins ${filters.period}`, remove: (filters: ResourceFilters) => ({ ...filters, period: 0 }) }
      : undefined,

    (filters) => filters.parent && this.tree
      ? { label: `Appartient au cercle ${circleFromTree(this.tree, filters.parent)?.name}`, remove: (filters) => ({ ...filters, parent: undefined }) }
      : undefined
  ];

  private user?: User;

  protected tree?: CircleTree;
  protected circles: CircleTree[] = [];

  protected indicators: FilterIncidator[] = [];
  protected completion = this.resourceService.completion().pipe(
    shareReplay(1)
  );


  protected readonly searchbar: SearchBar<string> = {
    placeholder: 'Essayez un nom, un topic, un niveau...',
    filterer: {
      run: (query) => {
        return this.completion.pipe(
          map(completion => {
            const suggestions = new Set<string>([
              ...completion.names,
              ...completion.topics,
              ...completion.levels,
            ]);
            return new Fuse(Array.from(suggestions), {
              includeMatches: true,
              findAllMatches: false,
              threshold: 0.2,
            }).search(query).map(e => e.item);
          })
        )
      },
    },
    onSearch: (query) => this.search(this.filters, query),
  }

  protected searching = true;
  protected showFiltersDrawer = false;
  protected filters: ResourceFilters = {};
  protected drawerFilters: ResourceFilters = {};
  protected circle!: Resource;
  protected items: Resource[] = [];
  protected views: Resource[] = [];
  protected recents: Resource[] = [];


  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.ready() as User;

    const [tree, circle, views, recents] = await Promise.all([
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(this.user.username)),
      firstValueFrom(this.resourceService.search({ views: true })),
      firstValueFrom(this.resourceService.search({
        period: 7,
        limit: 5,
        order: ResourceOrderings.UPDATED_AT,
        direction: OrderingDirections.DESC,
      })),
    ])

    this.tree = tree;
    this.circle = circle;
    this.views = views.resources;
    this.recents = recents.resources;

    this.circles = [];
    if (this.tree) {
      this.circles = flattenCircleTree(this.tree);
    }


    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(async (e: any) => {
        this.filters = this.drawerFilters = {
          ...this.filters,
          search: e.q,
          parent: e.parent,
          period: Number.parseInt(e.period, 10) || this.filters.period || 0,
          order: e.order,
          direction: e.direction,
          types: typeof e.types === 'string' ? [e.types] : e.types,
          status: typeof e.status === 'string' ? [e.status] : e.status,
        };

        if (this.searchbar.value !== e.q) {
          this.searchbar.value = e.q;
        }

        this.searching = true;
        this.items = (
          await firstValueFrom(this.resourceService.search(this.filters))
        ).resources;
        this.searching = false;

        this.indicators = [];
        this.filterMatchers.forEach(matcher => {
          const indicator = matcher(this.filters);
          if (indicator) {
            this.indicators.push({
              ...indicator,
              remove: (filters) => {
                const data = indicator.remove(filters)
                this.search(data, data.search);
              },
            } as FilterIncidator);
          }
        });

        this.changeDetectorRef.markForCheck();
      })
    );

    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected showFilters() {
    this.showFiltersDrawer = true;
  }

  protected closeFilters() {
    this.showFiltersDrawer = false;
  }

  protected applyFilters() {
    this.showFiltersDrawer = false;
    this.search(this.drawerFilters, this.filters.search);
  }

  protected search(filters: ResourceFilters, query?: string) {
    const queryParams: Params = {
      q: query,
      period: filters.period,
      order: filters.order,
      direction: filters.direction,
      types: filters.types,
      status: filters.status,
      parent: filters.parent,
    };

    this.router.navigate([], {
      queryParams,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

}



interface FilterIncidator {
  label: string,
  remove: (filters: ResourceFilters) => ResourceFilters
}

type FilterMatcher = (filters: ResourceFilters) => FilterIncidator | undefined
