import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { ActivityList, ActivityRow } from '@platon/design-system'
import { ActivityRowView } from '../../../../shared/activity-row'

/** Activities of a student, in a list named by `label`: each with its progress and what to do. */
@Component({
  selector: 'app-student-rows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActivityList, ActivityRow],
  templateUrl: './student-rows.html',
  styleUrl: './student-rows.scss',
})
export class StudentRows {
  readonly rows = input.required<ActivityRowView[]>()
  readonly label = input.required<string>()
}
