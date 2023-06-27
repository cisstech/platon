/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Fuse from 'fuse.js';
import { firstValueFrom, map, of, shareReplay, Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import {
  FilterIndicator,
  FilterMatcher,
  matchIndicators,
  PeriodFilterMatcher,
  SearchBar,
  UiFilterIndicatorComponent,
  UiSearchBarComponent,
} from '@platon/shared/ui';

import { AuthService } from '@platon/core/browser';
import { OrderingDirections, User } from '@platon/core/common';
import {
  CourseFiltersComponent,
  CourseListComponent,
  CourseOrderingFilterMatcher,
  CoursePipesModule,
  CourseService,
} from '@platon/feature/course/browser';
import {
  Course,
  CourseFilters,
  CourseOrderings,
} from '@platon/feature/course/common';
import { UserRoles } from '@platon/core/common';

@Component({
  standalone: true,
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatIconModule,

    NzSpinModule,
    NzIconModule,
    NzButtonModule,

    CoursePipesModule,
    CourseListComponent,
    CourseFiltersComponent,

    UiSearchBarComponent,
    UiFilterIndicatorComponent,
  ],
})
export class CoursesPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly filterMatchers: FilterMatcher<CourseFilters>[] = [
    ...Object.values(CourseOrderings).map(CourseOrderingFilterMatcher),
    PeriodFilterMatcher,
  ];

  protected readonly searchbar: SearchBar<string> = {
    placeholder: 'Essayez un nom...',
    filterer: {
      run: (query) => {
        return this.completion.pipe(
          map(() => {
            const suggestions = new Set<string>([]);
            return new Fuse(Array.from(suggestions), {
              includeMatches: true,
              findAllMatches: false,
              threshold: 0.2,
            })
              .search(query)
              .map((e) => e.item);
          })
        );
      },
    },
    onSearch: (query) => this.search(this.filters, query),
  };

  private user?: User;
  protected canCreateCourse = false;

  protected indicators: FilterIndicator<CourseFilters>[] = [];

  protected completion = of([]).pipe(
    // TODO implements server function
    shareReplay(1)
  );

  protected searching = true;
  protected filters: CourseFilters = {};
  protected items: Course[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly courseService: CourseService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User;
    this.canCreateCourse =
      this.user?.role === UserRoles.teacher ||
      this.user?.role === UserRoles.admin;
    this.changeDetectorRef.markForCheck();

    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(async (e: QueryParams) => {
        this.filters = {
          ...this.filters,
          search: e.q,
          period:
            Number.parseInt(e.period + '', 10) || this.filters.period || 0,
          order: e.order,
          direction: e.direction,
        };

        if (this.searchbar.value !== e.q) {
          this.searchbar.value = e.q;
        }

        this.searching = true;
        this.items = (
          await firstValueFrom(this.courseService.search(this.filters))
        ).resources;
        this.searching = false;

        this.indicators = matchIndicators(
          this.filters,
          this.filterMatchers,
          (data) => this.search(data, data.search)
        );

        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected search(filters: CourseFilters, query?: string) {
    const queryParams: QueryParams = {
      q: query,
      period: filters.period,
      order: filters.order,
      direction: filters.direction,
    };

    this.router.navigate([], {
      queryParams,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }
}

interface QueryParams {
  q?: string;
  period?: string | number;
  order?: CourseOrderings;
  direction?: OrderingDirections;
}
