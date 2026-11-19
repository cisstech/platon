import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, input, viewChild } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CourseMark } from '../course-mark/course-mark'
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/**
 * A course as a binder: its tab and its cover in the hue of the course, ruled like a notebook, with
 * its monogram; its name, which opens it, then its description; and at its foot what the page says
 * of it. The whole binder opens the course; a badge on the cover (`badge`) and the actions of the
 * course (`plBinderActions`, such as a menu button) stay apart; the badge is read after the name of
 * the course, with it. `compact` gives a row for a narrow screen: the mark of the course instead of
 * the cover, without the description and the badge.
 */
@Component({
  selector: 'pl-binder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CourseMark, Icon, RouterLink],
  host: {
    '[attr.data-hue]': 'hue()',
    '[attr.data-compact]': "compact() ? '' : null",
  },
  templateUrl: './binder.html',
  styleUrl: './binder.scss',
})
export class Binder {
  readonly heading = input.required<string>()
  readonly description = input<string>()
  /** A few letters and a number: « AP1 ». */
  readonly monogram = input.required<string>()
  readonly hue = input.required<CourseHue>()
  /** Where the course opens, through the router. */
  readonly href = input.required<string>()
  /** A short word on the cover, a link: « 1 challenge ». */
  readonly badge = input<string>()
  readonly badgeHref = input<string>()
  readonly badgeIcon = input<IconName>()
  readonly compact = input(false, { transform: booleanAttribute })

  private readonly link = viewChild.required<ElementRef<HTMLAnchorElement>>('link')

  /** Focuses the link that opens the course. */
  focus(): void {
    this.link().nativeElement.focus()
  }
}
