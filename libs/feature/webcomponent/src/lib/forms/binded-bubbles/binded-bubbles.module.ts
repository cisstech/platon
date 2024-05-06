import { NgModule, Type } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'

import { IDynamicModule } from '@cisstech/nge/services'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { BaseModule } from '../../shared/components/base/base.module'
import { CssPipeModule } from '../../shared/pipes/css.pipe'

import { BindedBubblesComponent } from './binded-bubbles.component'

@NgModule({
  declarations: [BindedBubblesComponent],
  imports: [BaseModule, CssPipeModule, MatButtonModule, NgeMarkdownModule],
  exports: [BindedBubblesComponent],
})
export class BindedBubblesModule implements IDynamicModule {
  component: Type<unknown> = BindedBubblesComponent
}
