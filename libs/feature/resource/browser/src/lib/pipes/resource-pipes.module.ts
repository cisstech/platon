
import { NgModule } from '@angular/core';
import { ResourceColorPipe } from './resource-color.pipe';
import { ResourceIconPipe } from './resource-icon.pipe';
import { ResourceTypePipe } from './resource-type.pipe';
import { ResourceStatusColorPipe } from './resource-status-color.pipe';
import { ResourceStatusPipe } from './resource-status.pipe';
import { ResourceOrderingPipe } from './resource-ordering.pipe';


@NgModule({
  exports: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
  ],
  declarations: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
  ],
})
export class ResourcePipesModule { }
