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

  onSelect(data: unknown): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: unknown): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: unknown): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
