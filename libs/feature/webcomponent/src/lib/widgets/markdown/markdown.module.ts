import { NgModule, Type } from '@angular/core';

import { IDynamicModule } from '@cisstech/nge/services';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';

import { BaseModule } from '../../shared/components/base/base.module';

import { MarkdownComponent } from './markdown.component';

@NgModule({
  declarations: [MarkdownComponent],
  imports: [BaseModule, NgeMarkdownModule],
  exports: [MarkdownComponent],
})
export class MarkdownModule implements IDynamicModule {
  component: Type<unknown> = MarkdownComponent;
}
