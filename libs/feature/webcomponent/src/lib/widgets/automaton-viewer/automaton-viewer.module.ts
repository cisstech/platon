import { NgModule, Type } from '@angular/core';
import { IDynamicModule } from '@cisstech/nge/services';

import { RenderDotModule } from '../../shared/directives/render-dot.directive';
import { BaseModule } from '../../shared/components/base/base.module';

import { AutomatonViewerComponent } from './automaton-viewer.component';

@NgModule({
  declarations: [AutomatonViewerComponent],
  imports: [BaseModule, RenderDotModule],
  exports: [AutomatonViewerComponent],
})
export class AutomatonViewerModule implements IDynamicModule {
  component: Type<unknown> = AutomatonViewerComponent;
}
