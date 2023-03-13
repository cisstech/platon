import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { DialogModule } from '@platon/core/browser';
import { AnswerResultsByExercisesComponent, AnswerResultsByMembersComponent } from '@platon/feature/answer/browser';
import { CourseActivityCardComponent } from '@platon/feature/course/browser';

import { ActivityPresenter } from './activity.presenter';

@Component({
  standalone: true,
  selector: 'app-course-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActivityPresenter],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,
    MatCardModule,

    NzGridModule,
    NzProgressModule,
    NzStatisticModule,
    NzBreadCrumbModule,
    NzTypographyModule,

    CourseActivityCardComponent,
    AnswerResultsByMembersComponent,
    AnswerResultsByExercisesComponent,

    DialogModule,
  ]
})
export class CourseActivityPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  protected context = this.presenter.defaultContext();

  constructor(
    private readonly presenter: ActivityPresenter,
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
