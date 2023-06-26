import { NgModule, Type } from '@angular/core';
import { ChartViewerComponent } from './chart-viewer.component';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import { BaseModule } from '../../shared/components/base/base.module';
import { IDynamicModule } from '@cisstech/nge/services';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [ChartViewerComponent],
  imports: [
    BaseModule, 
    NgeMonacoModule,
    NgxChartsModule
  ],
  exports: [ChartViewerComponent],
})
export class ChartViewerModule implements IDynamicModule {
  component: Type<unknown> = ChartViewerComponent; 
}
