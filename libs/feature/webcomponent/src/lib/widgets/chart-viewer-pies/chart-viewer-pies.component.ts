import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, inject } from '@angular/core'
import { deepCopy } from '@platon/core/common'
import { EChartsOption } from 'echarts'
import { WebComponent, WebComponentHooks } from '../../web-component'
import {
  ChartViewerPiesComponentDefinition,
  ChartViewerPiesState,
  donutChartViewerPiesState,
  halfdonutChartViewerPiesState,
  nightingaleChartViewerPiesState,
  simpleChartViewerPiesState,
} from './chart-viewer-pies'

@Component({
  selector: 'wc-chart-viewer-pies, wc-cv-pies',
  templateUrl: './chart-viewer-pies.component.html',
  styleUrls: ['chart-viewer-pies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerPiesComponentDefinition)
export class ChartViewerPiesComponent implements WebComponentHooks<ChartViewerPiesState> {
  readonly injector = inject(Injector)
  readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected commonOption = simpleChartViewerPiesState
  protected mergedOption: EChartsOption = {}

  @Input() state!: ChartViewerPiesState

  onChangeState() {
    this.state.mode = this.state.mode ?? 'simple'

    this.mergedOption = {
      donut: deepCopy(donutChartViewerPiesState),
      simple: deepCopy(simpleChartViewerPiesState),
      nightingale: deepCopy(nightingaleChartViewerPiesState),
      'half-donut': deepCopy(halfdonutChartViewerPiesState),
    }[this.state.mode]

    if (Array.isArray(this.mergedOption.series)) {
      this.mergedOption.series[0].data = deepCopy(this.state.data)
      if (this.state.mode == 'half-donut') {
        if (Array.isArray(this.mergedOption.series) && Array.isArray(this.mergedOption.series[0]?.data)) {
          this.mergedOption.series[0].data = [
            ...this.mergedOption.series[0].data,
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
      this.mergedOption.series[0].name = this.state.dataTitle
    }

    this.mergedOption = {
      ...this.mergedOption,
      title: this.state.title,
      legend: this.state.legend,
      tooltip: this.state.tooltip,
    }
  }
}
