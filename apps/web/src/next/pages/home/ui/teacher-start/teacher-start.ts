import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Button, Empty, Icon, Step, Steps } from '@platon/design-system'

/**
 * The start of a teacher without a course: nothing is there yet, then the three steps that make
 * PLaTon useful, creating a course the only primary action.
 */
@Component({
  selector: 'app-teacher-start',
  imports: [Button, Empty, Icon, RouterLink, Step, Steps],
  templateUrl: './teacher-start.html',
  styleUrl: './teacher-start.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherStart {}
