
import { NgModule } from '@angular/core';
import { ResourceColorPipe } from './resource-color.pipe';
import { ResourceIconPipe } from './resource-icon.pipe';
import { ResourceNamePipe } from './resource-name.pipe';
import { StatusColorPipe } from './status-color.pipe';
import { StatusLabelPipe } from './status-label.pipe';


@NgModule({
  exports: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceNamePipe,
    StatusColorPipe,
    StatusLabelPipe,
  ],
  declarations: [
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceNamePipe,
    StatusColorPipe,
    StatusLabelPipe,
  ],
})
export class ResourcePipesModule { }
