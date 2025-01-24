import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { firstValueFrom, Subscription } from 'rxjs'

import { MatIconModule } from '@angular/material/icon'

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

import { DialogModule } from '@platon/core/browser'
import { CourseActivityCardComponent } from '@platon/feature/course/browser'
import {
  KCileComponent,
  ResultByExercisesComponent,
  ResultByMembersComponent,
  ResultLegendComponent,
  ResultService,
  ResultBoxPlotComponent,
} from '@platon/feature/result/browser'

import { DurationPipe, UiLayoutBlockComponent, UiStatisticCardComponent } from '@platon/shared/ui'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { ActivityPresenter } from './activity.presenter'
import { MatCardModule } from '@angular/material/card'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzSelectModule, NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { UserActivityResultsDistribution } from '@platon/feature/result/common'
import { NzSliderModule } from 'ng-zorro-antd/slider'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { PeerTreeComponent } from '@platon/feature/peer/browser'

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
    NzBreadCrumbModule,
    NzTypographyModule,
    NzPageHeaderModule,
    NzDatePickerModule,
    NzSelectModule,
    NzSliderModule,
    NzInputNumberModule,

    DialogModule,
    DurationPipe,

    CourseActivityCardComponent,
    ResultByMembersComponent,
    ResultByExercisesComponent,
    ResultLegendComponent,
    KCileComponent,
    ResultBoxPlotComponent,
    PeerTreeComponent,

    UiStatisticCardComponent,
    UiLayoutBlockComponent,
  ],
})
export class CourseActivityPage implements OnInit, OnDestroy {
  private readonly location = inject(Location)
  private readonly presenter = inject(ActivityPresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly resultService = inject(ResultService)
  private readonly subscriptions: Subscription[] = []

  protected userDistribution: UserActivityResultsDistribution[] = []
  protected context = this.presenter.defaultContext()
  protected KCileInsightsOption: { selectedBucket: number; possibleBucket: NzSelectOptionInterface[] } = {
    selectedBucket: 10,
    possibleBucket: [
      { label: '2', value: 2 },
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 },
    ],
  }
  protected dates: Date[] = []
  protected cursorValue = 100
  private today = new Date()
  protected lastDate: Date = this.today
  protected splitDate: Date = this.today

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.onDateChange([
          this.context.activity?.createdAt ?? this.today,
          this.context.activity?.closeAt ?? this.today,
        ])
          .then(() => this.changeDetectorRef.markForCheck())
          .catch(console.error)
      }),
      this.presenter.onDeletedActivity.subscribe(() => {
        this.location.back()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async onDateChange(dates: Date[]): Promise<void> {
    this.dates = dates
    this.lastDate = dates[1]
    if (this.context.activity?.id === undefined || this.dates.length !== 2) {
      return
    }
    this.userDistribution = await firstValueFrom(
      this.resultService.activityResultsForDate(this.context.activity?.id, this.dates[0], this.dates[1])
    )
    const nbperson = this.userDistribution.filter((user) => Object.keys(user.nbSuccess).length !== 0).length
    this.KCileInsightsOption.possibleBucket = this.KCileInsightsOption.possibleBucket.filter(
      (bucket) => nbperson / bucket.value >= 1
    )
    this.KCileInsightsOption.selectedBucket =
      this.KCileInsightsOption.possibleBucket[this.KCileInsightsOption.possibleBucket.length - 1]?.value ?? 0

    this.changeDetectorRef.markForCheck()
  }

  protected disabledDate = (current: Date) => {
    return (this.context.activity?.createdAt ?? 0) > current
  }

  protected formatterDate = (value: number) => {
    const date = this.convertNumberToDate(value)
    return date.toLocaleDateString()
  }

  protected splitDateChange(event: number) {
    this.splitDate = this.convertNumberToDate(event)
    this.changeDetectorRef.markForCheck()
  }

  private convertNumberToDate(value: number): Date {
    const startDate = this.context.activity?.createdAt.getTime()
    const endDate = this.context.activity?.closeAt?.getTime() ?? this.today.getTime()
    if (startDate === undefined) {
      return new Date()
    }
    const date = new Date(startDate + (endDate - startDate) * (value / 100))
    return date
  }
}
