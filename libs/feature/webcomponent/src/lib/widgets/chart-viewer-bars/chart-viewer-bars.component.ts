import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, inject } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { EChartsOption } from 'echarts'
import {
  ChartViewerBarsComponentDefinition,
  ChartViewerBarsState,
  horizontalChartViewerBarsState,
  verticalChartViewerBarsState,
} from './chart-viewer-bars'
import { deepCopy } from '@cisstech/nge/utils'

@Component({
  selector: 'wc-chart-viewer-bars, wc-cv-bars',
  templateUrl: './chart-viewer-bars.component.html',
  styleUrls: ['chart-viewer-bars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerBarsComponentDefinition)
export class ChartViewerBarsComponent implements WebComponentHooks<ChartViewerBarsState> {
  readonly injector = inject(Injector)
  readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected commonOption = horizontalChartViewerBarsState
  protected mergedOption: EChartsOption = {}

  @Input() state!: ChartViewerBarsState

  onChangeState() {
    this.state.mode = this.state.mode ?? 'simple'

    this.mergedOption = {
      horizontal: deepCopy(horizontalChartViewerBarsState),
      vertical: deepCopy(verticalChartViewerBarsState),
    }[this.state.mode]

    if (Array.isArray(this.mergedOption.series)) {
      this.mergedOption.series[0].data = deepCopy(this.state.data)
      this.mergedOption.series[0].name = this.state.dataTitle
    }

    this.mergedOption = {
      ...this.mergedOption,
      title: this.state.title,
      legend: this.state.legend,
      tooltip: this.state.tooltip,
    }

    if (this.state.mode === 'horizontal') {
      this.mergedOption = {
        ...this.mergedOption,
        xAxis: {
          ...this.mergedOption.xAxis,
          type: 'category',
          data: this.state.data.map((d) => d.name),
        },
        yAxis: {
          ...this.mergedOption.yAxis,
          type: 'value',
        },
      }
    } else {
      this.mergedOption = {
        ...this.mergedOption,
        yAxis: {
          ...this.mergedOption.yAxis,
          type: 'category',
          data: this.state.data.map((d) => d.name),
        },
        xAxis: {
          ...this.mergedOption.xAxis,
          type: 'value',
        },
      }
    }
  }
}
