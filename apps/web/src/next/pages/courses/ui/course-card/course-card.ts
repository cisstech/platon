import { ChangeDetectionStrategy, Component, booleanAttribute, input, output, viewChild } from '@angular/core'
import { Binder, Icon, Progress } from '@platon/design-system'
import { CourseCardView } from '../../courses.vm'
import { CourseAction, CourseMenu } from '../course-menu/course-menu'

/**
 * A course of the list, in its binder: for a teacher, the headcount, then the day of the last update;
 * for a student, their progress, who teaches and their next deadline. Its menu says what the person
 * may do with it. `compact` gives the row of a narrow screen.
 */
@Component({
  selector: 'app-course-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Binder, CourseMenu, Icon, Progress],
  templateUrl: './course-card.html',
  styleUrl: './course-card.scss',
})
export class CourseCard {
  readonly card = input.required<CourseCardView>()
  /** The course is in the person's archives. */
  readonly archived = input(false, { transform: booleanAttribute })
  readonly compact = input(false, { transform: booleanAttribute })
  readonly chosen = output<CourseAction>()

  private readonly binder = viewChild.required(Binder)
  private readonly menu = viewChild.required(CourseMenu)

  /** Focuses the link that opens the course. */
  focus(): void {
    this.binder().focus()
  }

  /** Focuses the button of its actions, or the link of the course without any. */
  focusActions(): void {
    if (!this.menu().focus()) this.focus()
  }
}
