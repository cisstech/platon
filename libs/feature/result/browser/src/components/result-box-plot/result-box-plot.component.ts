import * as echarts from 'echarts/core'
import {
  DatasetComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  TransformComponent,
} from 'echarts/components'
import { BoxplotChart, ScatterChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  HostListener,
  Input,
} from '@angular/core'
import { ExerciseResults } from '@platon/feature/result/common'

@Component({
  selector: 'result-box-plot',
  templateUrl: './result-box-plot.component.html',
  styleUrls: ['./result-box-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ResultBoxPlotComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef
  private chartInstance!: echarts.ECharts
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  @Input()
  set data(data: ExerciseResults[] | undefined) {
    this.chartInstance = echarts.init(this.chartContainer.nativeElement)
    this.drawChart(data || [])
    this.changeDetectorRef.detectChanges()
  }

  constructor() {
    echarts.use([
      DatasetComponent,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      TransformComponent,
      BoxplotChart,
      ScatterChart,
      CanvasRenderer,
      UniversalTransition,
    ])
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.chartInstance.resize()
    }, 0)
  }

  drawChart(data: ExerciseResults[]) {
    // Préparation des données
    const preparedData = data.map((exercise) => {
      if (!exercise.details || exercise.details.length === 0) {
        return [0, 0, 0, 0, 0]
      }
      const sortedDetails = [...exercise.details].sort((a, b) => a - b)
      const min = sortedDetails[0]
      const Q1 = sortedDetails[Math.floor(sortedDetails.length / 4)]
      const median = sortedDetails[Math.floor(sortedDetails.length / 2)]
      const Q3 = sortedDetails[Math.floor((3 * sortedDetails.length) / 4)]
      const max = sortedDetails[sortedDetails.length - 1]
      return [min, Q1, median, Q3, max]
    })

    const option = {
      title: {
        text: 'Diagramme à moustaches',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        name: 'Exercices',
        data: data.map((exercise) => exercise.title),
        splitArea: {
          show: true,
        },
        axisLabel: {
          rotate: 25,
          fontSize: 10,
          interval: 0,
          formatter: (value: string) => (value.length > 17 ? value.slice(0, 17) + '...' : value),
        },
      },
      yAxis: {
        type: 'value',
        name: 'Score',
        min: -1,
        max: 100,
        splitArea: {
          show: true,
        },
      },
      series: [
        {
          name: 'Boxplot',
          type: 'boxplot',
          data: preparedData,
          colorBy: 'data',
          tooltip: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) =>
              `Min: ${params.data[1]}<br>Q1: ${params.data[2]}<br>Median: ${params.data[3]}<br>Q3: ${params.data[4]}<br>Max: ${params.data[5]}`,
          },
        },
      ],
      grid: {
        bottom: 80,
      },
    }

    this.chartInstance.setOption(option)
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chartInstance) {
      this.chartInstance.resize()
    }
  }
}
