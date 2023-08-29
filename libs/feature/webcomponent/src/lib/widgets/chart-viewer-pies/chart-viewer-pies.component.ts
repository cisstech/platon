import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import {
  ChartViewerPiesComponentDefinition,
  ChartViewerPiesState,
  donutChartViewerPiesState,
  halfdonutChartViewerPiesState,
  nightingaleChartViewerPiesState,
  simpleChartViewerPiesState,
} from './chart-viewer-pies'
import { EChartsOption } from 'echarts'

@Component({
  selector: 'wc-chart-viewer-pies, wc-cv-pies',
  templateUrl: './chart-viewer-pies.component.html',
  styleUrls: ['chart-viewer-pies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerPiesComponentDefinition)
export class ChartViewerPiesComponent implements WebComponentHooks<ChartViewerPiesState> {
  @Input() state!: ChartViewerPiesState

  constructor(readonly injector: Injector) {}

  chartOption: EChartsOption = simpleChartViewerPiesState

  getChartOption() {
    switch (this.state.mode) {
      case 'half-donut': {
        return halfdonutChartViewerPiesState
      }
      case 'donut': {
        return donutChartViewerPiesState
      }
      case 'nightingale': {
        return nightingaleChartViewerPiesState
      }
      default: {
        return simpleChartViewerPiesState
      }
    }
  }

  onChangeState() {
    this.chartOption = this.getChartOption()
    if (Array.isArray(this.chartOption.series)) {
      this.chartOption.series[0].data = this.state.data
      if (this.state.mode == 'half-donut') {
        if (Array.isArray(this.chartOption.series) && Array.isArray(this.chartOption.series[0]?.data)) {
          this.chartOption.series[0].data = [
            ...this.chartOption.series[0].data,
            // The adding piece to hide half of the chart
            {
              value: this.state.data.map((element) => element.value).reduce((sum, value) => sum + value, 0),
              itemStyle: {
                // stop the chart from rendering this piece
                color: 'none',
                decal: {
                  symbol: 'none',
                },
              },
              label: {
                show: false,
              },
            },
          ]
          // make an record to fill the bottom 50%
        } else {
          console.log('error')
        }
      }
      this.chartOption.series[0].name = this.state.dataTitle
    }
    this.chartOption.title = this.state.title
    this.chartOption.legend = this.state.legend
    this.chartOption.tooltip = this.state.tooltip
  }
}
