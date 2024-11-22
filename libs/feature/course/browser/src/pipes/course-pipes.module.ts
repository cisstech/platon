import { NgModule } from '@angular/core'
import { CourseActivityStatePipe } from './course-activity-state.pipe'
import { CourseOrderingPipe } from './course-ordering.pipe'
import { DisplayCourseMemberRolePipe } from './display-course-member-role.pipe'

@NgModule({
  exports: [CourseOrderingPipe, CourseActivityStatePipe, DisplayCourseMemberRolePipe],
  declarations: [CourseOrderingPipe, CourseActivityStatePipe, DisplayCourseMemberRolePipe],
})
export class CoursePipesModule {}
