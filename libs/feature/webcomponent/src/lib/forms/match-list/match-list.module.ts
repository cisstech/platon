import { NgModule, Type } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { BaseModule } from '../../shared/components/base/base.module'
import { MatchListComponent } from './match-list.component'

@NgModule({
  declarations: [MatchListComponent],
  imports: [BaseModule, NgeMarkdownModule],
  exports: [MatchListComponent],
})
export class MatchListModule implements IDynamicModule {
  component: Type<unknown> = MatchListComponent
}
