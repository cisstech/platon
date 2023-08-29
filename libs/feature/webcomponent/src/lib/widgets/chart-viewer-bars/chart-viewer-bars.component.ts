import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { EChartsOption } from 'echarts'
import {
  ChartViewerBarsComponentDefinition,
  ChartViewerBarsState,
  simpleChartViewerBarsState,
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

  chartOption: EChartsOption = simpleChartViewerBarsState

  constructor(readonly injector: Injector) {}

  onChangeState() {
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
