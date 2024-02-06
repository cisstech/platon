import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { MatIconModule } from '@angular/material/icon'

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

import { DialogModule } from '@platon/core/browser'
import { CourseActivityCardComponent } from '@platon/feature/course/browser'
import {
  ResultByExercisesComponent,
  ResultByMembersComponent,
  ResultLegendComponent,
} from '@platon/feature/result/browser'

import { DurationPipe, UiStatisticCardComponent } from '@platon/shared/ui'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { ActivityPresenter } from './activity.presenter'

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

    NzGridModule,
    NzBreadCrumbModule,
    NzTypographyModule,
    NzPageHeaderModule,

    DialogModule,
    DurationPipe,

    CourseActivityCardComponent,
    ResultByMembersComponent,
    ResultByExercisesComponent,
    ResultLegendComponent,
    UiStatisticCardComponent,
  ],
})
export class CourseActivityPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  protected context = this.presenter.defaultContext()

  constructor(
    private readonly location: Location,
    private readonly presenter: ActivityPresenter,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      }),
      this.presenter.onDeletedActivity.subscribe(() => {
        this.location.back()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
