import { NgModule, Type } from '@angular/core';

import { IDynamicModule } from '@cisstech/nge/services';
import { NgeMonacoModule } from '@cisstech/nge/monaco';

import { BaseModule } from '../../shared/components/base/base.module';
import { CodeViewerComponent } from './code-viewer.component';

@NgModule({
  declarations: [CodeViewerComponent],
  imports: [BaseModule, NgeMonacoModule],
  exports: [CodeViewerComponent],
})
export class CodeViewerModule implements IDynamicModule {
  component: Type<unknown> = CodeViewerComponent;
}
