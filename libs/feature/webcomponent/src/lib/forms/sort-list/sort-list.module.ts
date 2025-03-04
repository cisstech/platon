import { NgModule, Type } from '@angular/core'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatIconModule } from '@angular/material/icon'

import { IDynamicModule } from '@cisstech/nge/services'
import {
  NgeMarkdownModule,
  NgeMarkdownHighlighterProvider,
  NgeMarkdownHighlighterMonacoProvider,
} from '@cisstech/nge/markdown'

import { BaseModule } from '../../shared/components/base/base.module'
import { CssPipeModule } from '../../shared/pipes/css.pipe'

import { SortListComponent } from './sort-list.component'
import { NgeMonacoColorizerService, NgeMonacoModule, NGE_MONACO_THEMES } from '@cisstech/nge/monaco'

@NgModule({
  declarations: [SortListComponent],
  imports: [
    BaseModule,
    CssPipeModule,
    NgeMarkdownModule,
    NgeMonacoModule.forRoot({ theming: { themes: NGE_MONACO_THEMES } }),
    MatIconModule,
    DragDropModule,
  ],
  exports: [SortListComponent],
  providers: [NgeMarkdownHighlighterProvider, NgeMarkdownHighlighterMonacoProvider(NgeMonacoColorizerService)],
})
export class SortListModule implements IDynamicModule {
  component: Type<unknown> = SortListComponent
}
