import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core'
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'

let lastId = 0

/**
 * A section of a course as a divider of its binder: a tab in the hue of the course on a rule of the
 * same hue, its name and what it holds, its actions at the end of the rule (`plCourseSectionActions`),
 * then what it holds. `collapsible`, for a narrow screen, folds it under its divider, a button that
 * says whether it is open; its actions do not show there.
 */
@Component({
  selector: 'pl-course-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    '[attr.data-hue]': 'hue()',
    '[attr.data-collapsible]': "collapsible() ? '' : null",
  },
  templateUrl: './course-section.html',
  styleUrl: './course-section.scss',
})
export class CourseSection {
  readonly heading = input.required<string>()
  /** What it holds: « 3 activités », « 3 activités, 2 à faire ». */
  readonly summary = input<string>()
  readonly hue = input.required<CourseHue>()
  readonly collapsible = input(false, { transform: booleanAttribute })
  /** Whether a collapsible section shows what it holds. */
  readonly expanded = model(true)

  protected readonly bodyId = `pl-course-section-body-${++lastId}`
}
