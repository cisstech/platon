/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { SearchBar, SearchBarComponent } from '@platon/shared/ui';

import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ResourceListComponent, ResourceService, RESOURCE_ORDERING_NAMES, RESOURCE_STATUS_NAMES, RESOURCE_TYPE_NAMES } from '@platon/feature/resource/browser';
import { Resource, ResourceFilters, ResourceOrderings, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common';
import Fuse from 'fuse.js';
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

    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,

    NzSpinModule,
    NzDrawerModule,

    ResourceListComponent,


    FiltersComponent,
    SearchBarComponent,
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
      ? { label: 'Modifié il y a au moins ' + filters.period, remove: (filters: ResourceFilters) => ({ ...filters, period: 0 }) }
      : undefined
  ];

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
  protected items: Resource[] = [];
  protected recents: Resource[] = [];


  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(async (e: any) => {
        this.filters = this.drawerFilters = {
          ...this.filters,
          search: e.q,
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
        this.items = (await firstValueFrom(this.resourceService.search(this.filters))).resources;
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
