import { ChangeDetectionStrategy, Component, Injector, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core'
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
import { deepCopy } from '@platon/core/common'

@Component({
  selector: 'wc-chart-viewer-pies, wc-cv-pies',
  templateUrl: './chart-viewer-pies.component.html',
  styleUrls: ['chart-viewer-pies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerPiesComponentDefinition)
export class ChartViewerPiesComponent implements WebComponentHooks<ChartViewerPiesState>, AfterViewInit {
  @Input() state!: ChartViewerPiesState

  constructor(readonly injector: Injector, readonly changeDetectorRef: ChangeDetectorRef) {}

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

  ngAfterViewInit(): void {
    this.onChangeState()
    this.changeDetectorRef.markForCheck()
  }

  onChangeState() {
    console.log('Changed state:' + JSON.stringify(this.state))
    this.chartOption = deepCopy(this.getChartOption())
    if (Array.isArray(this.chartOption.series)) {
      this.chartOption.series[0].data = deepCopy(this.state.data)
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
      this.chartOption.series[0].name = JSON.parse(JSON.stringify(this.state.dataTitle))
    }
    this.chartOption.title = JSON.parse(JSON.stringify(this.state.title))
    this.chartOption.legend = JSON.parse(JSON.stringify(this.state.legend))
    this.chartOption.tooltip = JSON.parse(JSON.stringify(this.state.tooltip))
    console.log('ChartOption:' + JSON.stringify(this.chartOption))
  }
}
