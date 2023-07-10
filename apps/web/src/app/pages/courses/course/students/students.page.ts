import { ChangeDetectionStrategy, Component } from '@angular/core'

import { CourseMembersPage } from '../members/members.page'

@Component({
  standalone: true,
  selector: 'app-course-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CourseMembersPage],
})
export class CourseStudentsPage {}
