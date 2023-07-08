import { NgModule, Type } from '@angular/core'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatIconModule } from '@angular/material/icon'

import { IDynamicModule } from '@cisstech/nge/services'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

import { BaseModule } from '../../shared/components/base/base.module'
import { CssPipeModule } from '../../shared/pipes/css.pipe'

import { SortListComponent } from './sort-list.component'

@NgModule({
  declarations: [SortListComponent],
  imports: [BaseModule, CssPipeModule, NgeMarkdownModule, MatIconModule, DragDropModule],
  exports: [SortListComponent],
})
export class SortListModule implements IDynamicModule {
  component: Type<unknown> = SortListComponent
}
