import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatCardModule } from '@angular/material/card'

import { MatIconModule } from '@angular/material/icon'
import { ResultAnswerDistributionComponent, ResultValueDistributionComponent } from '@platon/feature/result/browser'
import {
  DurationPipe,
  UiError403Component,
  UiError404Component,
  UiError500Component,
  UiStatisticCardComponent,
} from '@platon/shared/ui'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'

import { FormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { OverviewPresenter } from './overview.presenter'

@Component({
  standalone: true,
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    MatIconModule,
    MatCardModule,

    NzGridModule,
    NzButtonModule,
    NzSelectModule,
    NzSkeletonModule,
    NzDatePickerModule,

    DurationPipe,

    ResultValueDistributionComponent,
    ResultAnswerDistributionComponent,

    UiError403Component,
    UiError404Component,
    UiError500Component,
    UiStatisticCardComponent,
  ],
  providers: [OverviewPresenter],
})
export class OverviewPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(OverviewPresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected context = this.presenter.defaultContext()
  protected learningInsightsDate = new Date()
  protected learningInsightsOption: 'score' | 'duration' = 'score'

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context

        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
