import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import {
  ChartViewerBarsComponentDefinition,
  ChartViewerBarsState
} from './chart-viewer-bars';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
  
@Component({
  selector: 'wc-chart-viewer-bars, wc-cv-bars',
  templateUrl: './chart-viewer-bars.component.html',
  styleUrls: ['chart-viewer-bars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(ChartViewerBarsComponentDefinition)
export class ChartViewerBarsComponent
  implements WebComponentHooks<ChartViewerBarsState>
{
  @Input() state!: ChartViewerBarsState;

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
