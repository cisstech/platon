import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
  } from '@angular/core';
  import { WebComponent, WebComponentHooks } from '../../web-component';
  import {
    ChartViewerComponentDefinition,
    ChartViewerState
  } from './chart-viewer';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
  
  @Component({
    selector: 'wc-chart-viewer, wc-cv',
    templateUrl: 'chart-viewer.component.html',
    styleUrls: ['chart-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  @WebComponent(ChartViewerComponentDefinition)
  export class ChartViewerComponent
    implements WebComponentHooks<ChartViewerState>
  {
    @Input() state!: ChartViewerState;
    
    // default options to content compiler
    default_showXAxis = true;
    default_showYAxis = true;
    default_gradient = false;
    default_showLegend = true;
    default_legendPosition : LegendPosition = LegendPosition.Right;
    default_showXAxisLabel = true;
    default_yAxisLabel = 'Axe Y';
    default_showYAxisLabel = true;
    default_xAxisLabel  = 'Axe X';
    default_colorScheme : string | Color = "forest";
    default_schemeType : ScaleType = ScaleType.Ordinal;
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
  