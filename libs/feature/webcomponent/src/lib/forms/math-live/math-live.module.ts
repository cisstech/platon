import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { IconGrPipeModule } from '@cisstech/nge/pipes';

import { IDynamicModule } from '@cisstech/nge/services';

import { BaseModule } from '../../shared/components/base/base.module';
import { MathLiveComponent } from './math-live.component';

@NgModule({
  declarations: [MathLiveComponent],
  imports: [BaseModule, IconGrPipeModule],
  exports: [MathLiveComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MathLiveModule implements IDynamicModule {
  component: Type<unknown> = MathLiveComponent;
}
