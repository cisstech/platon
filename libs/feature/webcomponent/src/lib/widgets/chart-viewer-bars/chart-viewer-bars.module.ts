import { NgModule, Type } from '@angular/core'
import { ChartViewerBarsComponent } from './chart-viewer-bars.component'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { BaseModule } from '../../shared/components/base/base.module'
import { IDynamicModule } from '@cisstech/nge/services'
import { NgxEchartsModule } from 'ngx-echarts'

@NgModule({
  declarations: [ChartViewerBarsComponent],
  imports: [BaseModule, NgeMonacoModule, NgxEchartsModule],
  exports: [ChartViewerBarsComponent],
})
export class ChartViewerBarsModule implements IDynamicModule {
  component: Type<unknown> = ChartViewerBarsComponent
}
