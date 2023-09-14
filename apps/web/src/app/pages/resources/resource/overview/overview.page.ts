/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatChipsModule } from '@angular/material/chips'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'

import { EChartsOption } from 'echarts'

import { MatButtonModule } from '@angular/material/button'
import { RESOURCE_STATUS_COLORS_HEX, RESOURCE_STATUS_NAMES } from '@platon/feature/resource/browser'
import { ResourceStatisic, ResourceStatus } from '@platon/feature/resource/common'
import { NgxEchartsModule } from 'ngx-echarts'
import { ResourcePresenter } from '../resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatChipsModule,
    MatButtonModule,

    NzGridModule,
    NzEmptyModule,
    NzButtonModule,
    NzStatisticModule,

    NgxEchartsModule,
  ],
})
export class ResourceOverviewPage implements OnInit, AfterViewChecked, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  protected view: [number, number] = [0, 0]
  protected context = this.presenter.defaultContext()

  protected statusChart?: EChartsOption

  constructor(
    private readonly router: Router,
    private readonly presenter: ResourcePresenter,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        if (context.statistic) {
          this.buildStatusChart(context.statistic)
        }
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngAfterViewChecked(): void {
    this.view = [this.elementRef.nativeElement.offsetWidth * 0.65, 400]
    this.changeDetectorRef.markForCheck()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected searchByStatus(status: string) {
    this.router.navigate(['/resources'], {
      queryParams: {
        status,
        parents: this.context.resource?.id,
      },
    })
  }

  protected trackById(index: number, item: any) {
    return item.id || index
  }

  protected onClickedStatus(event: unknown) {
    const { dataIndex } = event as { dataIndex: number }
    const status = Object.values(ResourceStatus)[dataIndex]
    this.searchByStatus(status)
  }

  private buildStatusChart(statistic: ResourceStatisic): void {
    type Data = {
      label: string
      value: number
      percent: number
    }

    const statuses = Object.values(ResourceStatus)

    const valueByStatus = statuses.reduce((acc, status) => {
      const record = statistic as unknown as Record<string, number>
      acc[status] = record[status.toLowerCase()]
      return acc
    }, {} as Record<ResourceStatus, number>)

    const total = statuses.reduce((acc, status) => {
      acc += valueByStatus[status]
      return acc
    }, 0)

    const dataByStatus = statuses.reduce((acc, status) => {
      const data: Data = {
        label: RESOURCE_STATUS_NAMES[status],
        value: valueByStatus[status],
        percent: total ? Math.round((valueByStatus[status] / total) * 100) : 0,
      }
      acc[status] = data
      return acc
    }, {} as Record<ResourceStatus, Data>)

    this.statusChart = {
      toolbox: {
        show: true,
      },
      legend: {
        orient: 'vertical',
        left: '0',
        top: 'center',
        icon: 'roundRect',
        formatter: (name: string) => {
          const status = Object.values(ResourceStatus).find(
            (status) => RESOURCE_STATUS_NAMES[status] === name
          ) as ResourceStatus
          return `${name}: {bold|${dataByStatus[status].value}} (${dataByStatus[status].percent}%)`
        },
        data: statuses.map((status) => RESOURCE_STATUS_NAMES[status]),
        textStyle: {
          rich: {
            bold: {
              fontWeight: 'bold',
            },
          },
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          animationType: 'expansion',
          color: statuses.map((status) => RESOURCE_STATUS_COLORS_HEX[status]),
          label: {
            show: false,
            position: 'center',
            // formatter: '{b}\n{c} ({d}%)',
          },
          labelLine: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
            },
          },
          itemStyle: {
            borderRadius: 12,
            borderColor: '#FFF',
            borderWidth: 2,
          },
          data: statuses.map((status) => ({
            name: dataByStatus[status].label,
            value: dataByStatus[status].value,
          })),
        },
      ],
    }
  }
}
