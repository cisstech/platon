import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, inject } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import {
  ChartViewerRadarComponentDefinition,
  ChartViewerRadarState,
  filledChartViewerRadarState,
  simpleChartViewerRadarState,
} from './chart-viewer-radar'
import { EChartsOption } from 'echarts'
import { deepCopy } from '@cisstech/nge/utils'
// import * as d3 from 'd3';

@Component({
  selector: 'wc-chart-viewer-radar, wc-cv-radar',
  templateUrl: './chart-viewer-radar.component.html',
  styleUrls: ['chart-viewer-radar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerRadarComponentDefinition)
export class ChartViewerRadarComponent implements WebComponentHooks<ChartViewerRadarState> {
  readonly injector = inject(Injector)
  readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected commonOption = simpleChartViewerRadarState
  protected mergedOption: EChartsOption = {}

  @Input() state!: ChartViewerRadarState

  onChangeState() {
    this.state.mode = this.state.mode ?? 'simple'

    this.mergedOption = {
      simple: deepCopy(simpleChartViewerRadarState),
      filled: deepCopy(filledChartViewerRadarState),
    }[this.state.mode]

    this.mergedOption.radar = {
      ...this.mergedOption.radar,
      indicator: this.state.indicators,
    }

    if (Array.isArray(this.mergedOption.series)) {
      this.mergedOption.series[0].data = deepCopy(this.state.data)
      this.mergedOption.series[0].name = this.state.dataTitle
    }

    this.mergedOption = {
      ...this.mergedOption,
      title: this.state.title,
      legend: this.state.legend,
      tooltip: this.state.tooltip,
      radar: {
        ...this.mergedOption.radar,
        shape: this.state.shape,
      },
    }
  }
}
