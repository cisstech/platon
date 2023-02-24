import { NgModule, Type } from '@angular/core';

import { IDynamicModule } from '@cisstech/nge/services';

import { RenderDotModule } from '../../shared/directives/render-dot.directive';
import { BaseModule } from '../../shared/components/base/base.module';
import { GraphViewerComponent } from './graph-viewer.component';

@NgModule({
  declarations: [GraphViewerComponent],
  imports: [BaseModule, RenderDotModule],
  exports: [GraphViewerComponent],
})
export class GraphViewerModule implements IDynamicModule {
  component: Type<unknown> = GraphViewerComponent;
}
