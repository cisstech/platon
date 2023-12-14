import { NgModule, Type } from '@angular/core'
import { ChartViewerRadarComponent } from './chart-viewer-radar.component'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { BaseModule } from '../../shared/components/base/base.module'
import { IDynamicModule } from '@cisstech/nge/services'
import { NgxEchartsModule } from 'ngx-echarts'

@NgModule({
  declarations: [ChartViewerRadarComponent],
  imports: [BaseModule, NgeMonacoModule, NgxEchartsModule],
  exports: [ChartViewerRadarComponent],
})
export class ChartViewerRadarModule implements IDynamicModule {
  component: Type<unknown> = ChartViewerRadarComponent
}
