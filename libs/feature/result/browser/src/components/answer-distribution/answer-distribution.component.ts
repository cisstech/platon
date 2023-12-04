import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AnswerStateColors, AnswerStateLabels, AnswerStates } from '@platon/feature/result/common'
import { EChartsOption } from 'echarts'
import { NgxEchartsModule } from 'ngx-echarts'

@Component({
  standalone: true,
  selector: 'result-answer-distribution',
  templateUrl: 'answer-distribution.component.html',
  styleUrls: ['./answer-distribution.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgxEchartsModule],
})
export class ResultAnswerDistributionComponent {
  protected chart?: EChartsOption

  @Input()
  set distribution(distribution: Record<AnswerStates, number>) {
    this.chart = this.buildChart(distribution)
  }

  private buildChart(distribution: Record<AnswerStates, number>): EChartsOption {
    type Data = {
      label: string
      value: number
      percent: number
    }

    const statuses = Object.values(AnswerStates)

    const total = statuses.reduce((acc, status) => {
      acc += distribution[status]
      return acc
    }, 0)

    const dataByStatus = statuses.reduce(
      (acc, status) => {
        const data: Data = {
          label: AnswerStateLabels[status],
          value: distribution[status],
          percent: total ? Math.round((distribution[status] / total) * 100) : 0,
        }
        acc[status] = data
        return acc
      },
      {} as Record<AnswerStates, Data>
    )

    return {
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Télécharger',
            name: 'Répartition des résultats',
          },
        },
      },
      legend: {
        top: 'bottom',
        icon: 'roundRect',
        formatter: (name: string) => {
          const status = Object.values(AnswerStates).find(
            (status) => AnswerStateLabels[status] === name
          ) as AnswerStates
          return `${name}: {bold|${dataByStatus[status].value}} (${dataByStatus[status].percent}%)`
        },
        data: statuses.map((status) => AnswerStateLabels[status]),
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
          radius: [50, 150],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          animationType: 'expansion',
          color: statuses.map((status) => AnswerStateColors[status]),
          label: {
            show: false,
            position: 'center',
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
