import { NgModule, Type } from '@angular/core'

import { MatCheckboxModule } from '@angular/material/checkbox'

import { IDynamicModule } from '@cisstech/nge/services'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { BaseModule } from '../../shared/components/base/base.module'
import { CssPipeModule } from '../../shared/pipes/css.pipe'

import { CheckboxGroupComponent } from './checkbox-group.component'

@NgModule({
  declarations: [CheckboxGroupComponent],
  imports: [BaseModule, CssPipeModule, MatCheckboxModule, NgeMarkdownModule],
  exports: [CheckboxGroupComponent],
})
export class CheckboxGroupModule implements IDynamicModule {
  component: Type<unknown> = CheckboxGroupComponent
}
