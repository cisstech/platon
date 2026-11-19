import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CourseHue, Progress } from '@platon/design-system'
import { StudentPanelView } from '../../student/course-student.vm'
import { StudentRows } from '../student-rows/student-rows'

/**
 * What a student has done in a course: their progress, counted in exercises, their time, and the
 * activity to resume first, the one thing to do on the page. On a phone, the page carries that action
 * under the thumb instead (`resume` false).
 */
@Component({
  selector: 'app-student-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Progress, StudentRows],
  templateUrl: './student-progress.html',
  styleUrl: './student-progress.scss',
})
export class StudentProgress {
  readonly panel = input.required<StudentPanelView>()
  readonly hue = input.required<CourseHue>()
  readonly resume = input(true)
}
