import { NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core'
import { CourseHue } from '../../hue/course-hue'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'
import { capitalize } from '../../text/text'
import { relativeTime } from '../../time/relative-time'

let lastId = 0

/**
 * One notification: an icon in the hue of the course concerned, a short title, then the course or the
 * resource and when it happened. With an `href`, the whole row is a link; without, a `choosable` row
 * is a button, and any other row only informs.
 * Actions that answer it (accept, decline) go in `plNotificationActions`, under the text; their
 * `aria-describedby` can point at `titleId`, so that each « Accepter » says what it accepts.
 */
@Component({
  selector: 'pl-notification-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, NgTemplateOutlet],
  host: {
    role: 'listitem',
    '[attr.data-unread]': "unread() ? '' : null",
    '[attr.data-choosable]': "href() || choosable() ? '' : null",
  },
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
})
export class NotificationItem {
  private readonly locale = inject(LOCALE_ID)

  /** A fact that stays true, in a few words. */
  readonly heading = input.required<string>()
  /** What it is about, when the title does not name it: a course, a circle. */
  readonly context = input<string>()
  readonly date = input.required<Date | string>()
  readonly icon = input.required<IconName>()
  /** The hue of the course concerned; neutral without. */
  readonly hue = input<CourseHue>()
  readonly unread = input(false)
  /** Read before the title of an unread notification, such as « Non lue : ». */
  readonly unreadLabel = input<string>()
  readonly href = input<string>()
  /** Without an `href`, makes the row a button: the page says what choosing it does. */
  readonly choosable = input(false)
  /**
   * The row was chosen. A link opens as any link does, unless the page prevents the default to do
   * something first, then navigates itself.
   */
  readonly chosen = output<MouseEvent>()
  /** Id of the title, for the `aria-describedby` of the actions. */
  readonly titleId = input(`pl-notification-title-${++lastId}`)

  private readonly main = viewChild<ElementRef<HTMLElement>>('main')

  /** Puts the focus on the row: its link, its button, or the row itself when it only informs. */
  focus(): void {
    this.main()?.nativeElement.focus()
  }

  /** A middle click opens the link aside: the page hears of it as of any other choice. */
  protected chooseAside(event: MouseEvent): void {
    if (event.button === 1) this.chosen.emit(event)
  }

  protected readonly dateTime = computed(() => new Date(this.date()).toISOString())
  /** Capitalized when it starts the line: « Hier », but « Analyse 1, hier ». */
  protected readonly when = computed(() => {
    const words = relativeTime(this.date(), this.locale)
    return this.context() ? words : capitalize(words, this.locale)
  })
}
