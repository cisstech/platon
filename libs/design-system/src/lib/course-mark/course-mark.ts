import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CourseHue } from '../hue/course-hue'

/** `sm`: in a row or a top bar; `md`: at the head of a page. */
export type CourseMarkSize = 'sm' | 'md'

/**
 * The mark of a course: its cover in small, ruled like a notebook, in the hue of the course, with
 * its monogram and its tab. It stands beside the name of the course, which says it to screen readers.
 */
@Component({
  selector: 'pl-course-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-hue]': 'hue()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './course-mark.html',
  styleUrl: './course-mark.scss',
})
export class CourseMark {
  /** A few letters and a number: « AP1 ». */
  readonly monogram = input.required<string>()
  readonly hue = input.required<CourseHue>()
  readonly size = input<CourseMarkSize>('md')
}
