import { NgModule, Type } from '@angular/core'
import { ChartViewerPiesComponent } from './chart-viewer-pies.component'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { BaseModule } from '../../shared/components/base/base.module'
import { IDynamicModule } from '@cisstech/nge/services'
import { NgxEchartsModule } from 'ngx-echarts'

@NgModule({
  declarations: [ChartViewerPiesComponent],
  imports: [BaseModule, NgeMonacoModule, NgxEchartsModule],
  exports: [ChartViewerPiesComponent],
})
export class ChartViewerPiesModule implements IDynamicModule {
  component: Type<unknown> = ChartViewerPiesComponent
}
