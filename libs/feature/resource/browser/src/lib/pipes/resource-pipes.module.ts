
import { NgModule } from '@angular/core';
import { ResourceEventTypePipe } from './event-type.pipe';
import { ResourceColorPipe } from './resource-color.pipe';
import { ResourceIconPipe } from './resource-icon.pipe';
import { ResourceOrderingPipe } from './resource-ordering.pipe';
import { ResourceStatusColorPipe } from './resource-status-color.pipe';
import { ResourceStatusPipe } from './resource-status.pipe';
import { ResourceTypePipe } from './resource-type.pipe';
import { ResourceVisibilityPipe } from './resource-visibility.pipe';


@NgModule({
  exports: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
    ResourceVisibilityPipe,
    ResourceEventTypePipe,
  ],
  declarations: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
    ResourceVisibilityPipe,
    ResourceEventTypePipe,
  ],
})
export class ResourcePipesModule { }
