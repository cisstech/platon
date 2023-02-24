import { NgModule, Type } from '@angular/core';

import { IDynamicModule } from '@cisstech/nge/services';

import { BaseModule } from '../../shared/components/base/base.module';
import { CssPipe, CssPipeModule } from '../../shared/pipes/css.pipe';
import { TextSelectComponent } from './text-select.component';

@NgModule({
  declarations: [TextSelectComponent],
  imports: [BaseModule, CssPipeModule],
  exports: [TextSelectComponent],
  providers: [CssPipe],
})
export class TextSelectModule implements IDynamicModule {
  component: Type<unknown> = TextSelectComponent;
}
