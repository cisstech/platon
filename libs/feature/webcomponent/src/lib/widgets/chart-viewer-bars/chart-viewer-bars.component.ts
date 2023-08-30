import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { EChartsOption } from 'echarts'
import {
  ChartViewerBarsComponentDefinition,
  ChartViewerBarsState,
  horizontalChartViewerBarsState,
  verticalChartViewerBarsState,
} from './chart-viewer-bars'

@Component({
  selector: 'wc-chart-viewer-bars, wc-cv-bars',
  templateUrl: './chart-viewer-bars.component.html',
  styleUrls: ['chart-viewer-bars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerBarsComponentDefinition)
export class ChartViewerBarsComponent implements WebComponentHooks<ChartViewerBarsState> {
  @Input() state!: ChartViewerBarsState

  chartOption: EChartsOption = verticalChartViewerBarsState

  constructor(readonly injector: Injector) {}

  getChartOption() {
    switch (this.state.mode) {
      case 'horizontal': {
        return horizontalChartViewerBarsState
      }
      default:
        return verticalChartViewerBarsState
    }
  }

  onChangeState() {
    this.chartOption = this.getChartOption()
    this.chartOption.title = this.state.title
    this.chartOption.tooltip = this.state.tooltip
    if (this.chartOption.dataset) {
      const temp = this.state.data.map((element) => [element.name, element.value])
      this.chartOption.dataset = {
        ...this.chartOption.dataset,
        source: [['key', 'value'], ...temp],
      }
    }
  }
}
