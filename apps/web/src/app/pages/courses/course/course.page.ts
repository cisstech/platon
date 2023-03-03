import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogModule } from '@platon/core/browser';
import { UiLayoutTabsComponent, UiLayoutTabsTitleDirective } from '@platon/shared/ui';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subscription } from 'rxjs';
import { CoursePresenter } from './course.presenter';

@Component({
  standalone: true,
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CoursePresenter],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    NzPopoverModule,


    NzIconModule,
    NzButtonModule,
    NzSelectModule,
    NzBreadCrumbModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,
  ]
})
export class CoursePage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
