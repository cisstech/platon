import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import {
  ChartViewerRadarComponentDefinition,
  ChartViewerRadarState
} from './chart-viewer-radar';
import * as d3 from 'd3';

@Component({
  selector: 'wc-chart-viewer-radar, wc-cv-radar',
  templateUrl: './chart-viewer-radar.component.html',
  styleUrls: ['chart-viewer-radar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerRadarComponentDefinition)
export class ChartViewerRadarComponent
  implements WebComponentHooks<ChartViewerRadarState>
{
  @Input() state!: ChartViewerRadarState;
  constructor(readonly injector: Injector) {
  }

  getCurve() {
    switch(this.state.mode) {
      case 'linear': return d3.curveLinearClosed;
      case 'basis': return d3.curveBasisClosed;
      case 'cardinal': return d3.curveCardinalClosed;
      default: return {};
    }
  }
}
