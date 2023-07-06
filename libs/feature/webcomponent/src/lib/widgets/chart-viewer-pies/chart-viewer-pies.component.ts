import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import {
  ChartViewerPiesComponentDefinition,
  ChartViewerPiesState
} from './chart-viewer-pies';
  
@Component({
  selector: 'wc-chart-viewer-pies, wc-cv-pies',
  templateUrl: './chart-viewer-pies.component.html',
  styleUrls: ['chart-viewer-pies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerPiesComponentDefinition)
export class ChartViewerPiesComponent
  implements WebComponentHooks<ChartViewerPiesState>
{
  @Input() state!: ChartViewerPiesState;

  constructor(readonly injector: Injector) {
  }
}
