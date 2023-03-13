
import { NgModule } from '@angular/core';
import { CourseActivityStatePipe } from './course-activity-state.pipe';
import { CourseOrderingPipe } from './course-ordering.pipe';


@NgModule({
  exports: [
    CourseOrderingPipe,
    CourseActivityStatePipe,
  ],
  declarations: [
    CourseOrderingPipe,
    CourseActivityStatePipe,
  ],
})
export class CoursePipesModule { }
