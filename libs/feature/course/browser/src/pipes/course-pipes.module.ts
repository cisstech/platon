
import { NgModule } from '@angular/core';
import { CourseOrderingPipe } from './course-ordering.pipe';


@NgModule({
  exports: [
    CourseOrderingPipe
  ],
  declarations: [
    CourseOrderingPipe
  ],
})
export class CoursePipesModule { }
