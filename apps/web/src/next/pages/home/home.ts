import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Session } from '../../core/session/session'
import { StudentHome } from './student/student-home'
import { TeacherHome } from './teacher/teacher-home'

/** The home of the person, by role: a teacher or an administrator has theirs, a student or a demo account theirs. */
@Component({
  selector: 'app-home',
  imports: [StudentHome, TeacherHome],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly teaches = inject(Session).isTeacher
}
