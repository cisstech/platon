import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core'
import { Button, Empty } from '@platon/design-system'
import { CourseTab, NoMatchView } from '../../courses.vm'

/**
 * Why a list of courses is empty: a search or a period that found nothing, with what clears it;
 * nothing archived; nothing on the platform; an administrator who belongs to no course; or no current
 * course, the archived ones kept apart.
 */
@Component({
  selector: 'app-course-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Empty],
  templateUrl: './course-empty.html',
})
export class CourseEmpty {
  readonly tab = input.required<CourseTab>()
  /** What a search or a period found nothing for. */
  readonly noMatch = input<NoMatchView>()
  readonly admin = input(false, { transform: booleanAttribute })
  /** How many courses the person archived. */
  readonly archived = input(0)
  readonly cleared = output<void>()
}
