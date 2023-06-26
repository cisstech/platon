import { NgModule, Type } from '@angular/core';
import { ChartViewerComponent } from './chart-viewer.component';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import { BaseModule } from '../../shared/components/base/base.module';
import { IDynamicModule } from '@cisstech/nge/services';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ChartViewerComponent],
  imports: [
    BaseModule, 
    NgeMonacoModule,
    NgxChartsModule,
    NzSelectModule,
    FormsModule
  ],
  exports: [ChartViewerComponent],
})
export class ChartViewerModule implements IDynamicModule {
  component: Type<unknown> = ChartViewerComponent; 
}
