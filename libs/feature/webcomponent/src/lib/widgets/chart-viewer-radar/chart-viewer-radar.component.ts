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
}
