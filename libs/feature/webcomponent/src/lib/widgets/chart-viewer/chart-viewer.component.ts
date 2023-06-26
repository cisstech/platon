import { multi } from './data';

import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Input,
  } from '@angular/core';
  import { WebComponent, WebComponentHooks } from '../../web-component';
  import {
    ChartViewerComponentDefinition,
    ChartViewerState,
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

    multi: any[]; 
    view: [number, number] = [700, 400];
    
    // options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    legendPosition : LegendPosition = LegendPosition.Right;
    showXAxisLabel = true;
    yAxisLabel = 'Country';
    showYAxisLabel = true;
    xAxisLabel  = 'Population';
  
    colorScheme : string | Color = "forest"
    schemeType : ScaleType = ScaleType.Linear;
  
    constructor(readonly injector: Injector) {
      this.multi = multi;
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
  