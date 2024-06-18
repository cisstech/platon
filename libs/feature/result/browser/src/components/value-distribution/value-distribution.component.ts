import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core'
import { DurationPipe } from '@platon/shared/ui'
import addWeeks from 'date-fns/addWeeks'
import format from 'date-fns/format'
import getWeeksInMonth from 'date-fns/getWeeksInMonth'
import startOfMonth from 'date-fns/startOfMonth'

import { CoreEchartsDirective } from '@platon/core/browser'
import { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'

@Component({
  standalone: true,
  selector: 'result-value-distribution',
  templateUrl: 'value-distribution.component.html',
  styleUrls: ['./value-distribution.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CoreEchartsDirective, DurationPipe],
  providers: [DurationPipe],
})
export class ResultValueDistributionComponent {
  private readonly durationPipe = inject(DurationPipe)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private currentDate = new Date()

  protected chart?: EChartsOption
  protected currentDistribution: Record<string, number> = {}

  get date(): Date {
    return this.currentDate
  }

  @Input()
  set date(value: Date) {
    this.currentDate = value
    this.chart = this.buildChart()
    this.changeDetectorRef.markForCheck()
  }

  @Input()
  set distribution(distribution: Record<string, number>) {
    this.currentDistribution = distribution
    this.chart = this.buildChart()
    this.changeDetectorRef.markForCheck()
  }

  @Input() legend?: string
  @Input() color = '#FFBF00'
  @Input() colorGradient = ['rgb(255, 191, 0)', 'rgb(224, 62, 76)']
  @Input() isTimeValues = false

  private buildChart(): EChartsOption {
    const year = this.date.getFullYear()
    const month = this.date.getMonth() + 1

    const weeks = getWeeksInMonth(this.date, {
      weekStartsOn: 1,
    })
    const dates = Object.keys(this.currentDistribution).filter((date) => {
      return date.startsWith(`${year}:${month}:`)
    })

    const monthStart = startOfMonth(this.date)

    return {
      color: [this.color],
      title: {
        text: format(this.date, 'MMM yyyy'),
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: [this.legend ?? ''],
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Télécharger',
          },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: Array.from({ length: weeks }, (_, i) => {
            const starts = format(addWeeks(monthStart, i), 'dd/MM')
            return `Semaine du ${starts}`
          }),
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: (value) => {
              return this.isTimeValues ? this.durationPipe.transform(value, 'seconds') : value.toString()
            },
          },
        },
      ],
      series: [
        {
          name: this.legend ?? '',
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 0,
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.colorGradient[0],
              },
              {
                offset: 1,
                color: this.colorGradient[1],
              },
            ]),
          },
          emphasis: {
            focus: 'series',
          },
          tooltip: {
            valueFormatter: (value) => {
              return this.isTimeValues ? this.durationPipe.transform(Number(value), 'seconds') : value?.toString() || ''
            },
          },
          data: Array.from({ length: weeks }, (_, i) => {
            const date = dates.find((date) => date.endsWith(`:${i + 1}`))
            return date ? this.currentDistribution[date] : 0
          }),
        },
      ],
    }
  }
}
