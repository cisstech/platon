import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { DialogModule } from '@platon/core/browser';
import {
  UiLayoutTabsComponent,
  UiLayoutTabsTitleDirective,
} from '@platon/shared/ui';

import { NzTypographyModule } from 'ng-zorro-antd/typography';
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

    NzBreadCrumbModule,
    NzTypographyModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,
  ],
})
export class CoursePage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected async updateName(name: string) {
    if (name.trim()) {
      await this.presenter.update({ name });
    }
  }

  protected async updateDesc(desc: string) {
    if (desc.trim()) {
      await this.presenter.update({ desc });
    }
  }
}
