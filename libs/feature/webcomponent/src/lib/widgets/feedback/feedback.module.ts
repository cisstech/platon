import { NgModule, Type } from '@angular/core'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { BaseModule } from '../../shared/components/base/base.module'
import { FeedbackComponent } from './feedback.component'

@NgModule({
  declarations: [FeedbackComponent],
  imports: [BaseModule, NzAlertModule, NzIconModule, NgeMarkdownModule],
  exports: [FeedbackComponent],
})
export class FeedbackModule implements IDynamicModule {
  component: Type<unknown> = FeedbackComponent
}
