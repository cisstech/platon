import { NgModule, Type } from '@angular/core'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzIconModule } from 'ng-zorro-antd/icon'

import { BaseModule } from '../../shared/components/base/base.module'
import { FoldableFeedbackComponent } from './foldable-feedback.component'

@NgModule({
  declarations: [FoldableFeedbackComponent],
  imports: [BaseModule, NzAlertModule, NzIconModule, NgeMarkdownModule],
  exports: [FoldableFeedbackComponent],
})
export class FoldableFeedbackModule implements IDynamicModule {
  component: Type<unknown> = FoldableFeedbackComponent
}
