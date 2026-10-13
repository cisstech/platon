import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'
import { calendarDay } from '../../time/relative-time'

let lastId = 0

/**
 * An announcement that opens in place, on a narrow screen where its content cannot sit beside the
 * list: a heading whose 44 px button says whether it is open, then its summary and its day, or, once
 * open, the content the page gives it. An unread one carries a dot, and `unreadLabel` before its title
 * for screen readers.
 */
@Component({
  selector: 'pl-announcement-disclosure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    '[attr.data-unread]': "unread() ? '' : null",
    '[attr.data-expanded]': "expanded() ? '' : null",
  },
  templateUrl: './announcement-disclosure.html',
  styleUrl: './announcement-disclosure.scss',
})
export class AnnouncementDisclosure {
  private readonly locale = inject(LOCALE_ID)

  readonly heading = input.required<string>()
  /** The level of its heading in the page. */
  readonly level = input(2)
  readonly summary = input<string>()
  readonly date = input.required<Date | string>()
  /** Its kind, in the same neutral color for every kind. */
  readonly icon = input.required<IconName>()
  readonly unread = input(false, { transform: booleanAttribute })
  /** Read before the title of an unread announcement, such as « Non lue : ». */
  readonly unreadLabel = input<string>()
  readonly expanded = model(false)

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button')

  protected readonly panelId = `pl-announcement-panel-${++lastId}`
  protected readonly dateTime = computed(() => new Date(this.date()).toISOString())
  protected readonly day = computed(() => calendarDay(this.date(), this.locale))

  /** Puts the focus on its button. */
  focus(): void {
    this.button().nativeElement.focus()
  }

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded)
  }
}
