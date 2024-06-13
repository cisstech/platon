import { NgModule } from '@angular/core'
import { ResourceEventTypePipe } from './event-type.pipe'
import { ResourceColorPipe } from './resource-color.pipe'
import { ResourceFindPipe } from './resource-find.pipe'
import { ResourceIconPipe } from './resource-icon.pipe'
import { ResourceOrderingPipe } from './resource-ordering.pipe'
import { ResourceStatusColorPipe } from './resource-status-color.pipe'
import { ResourceStatusIconPipe } from './resource-status-icon.pipe'
import { ResourceStatusPipe } from './resource-status.pipe'
import { ResourceTypePipe } from './resource-type.pipe'
import { ExerciseResourceMetaPipe } from './resource-exercise.pipe'

@NgModule({
  exports: [
    ResourceFindPipe,
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
    ResourceEventTypePipe,
    ResourceStatusIconPipe,
    ExerciseResourceMetaPipe,
  ],
  declarations: [
    ResourceFindPipe,
    ResourceColorPipe,
    ResourceIconPipe,
    ResourceTypePipe,
    ResourceStatusColorPipe,
    ResourceStatusPipe,
    ResourceOrderingPipe,
    ResourceEventTypePipe,
    ResourceStatusIconPipe,
    ExerciseResourceMetaPipe,
  ],
})
export class ResourcePipesModule {}
