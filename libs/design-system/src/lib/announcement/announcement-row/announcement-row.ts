import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'
import { shortCalendarDay } from '../../time/relative-time'

/**
 * An announcement in a list beside its content: the icon of its kind, its title, its summary and its
 * day. The row is a button that opens it; the open one is `current`. An unread one carries a dot, and
 * `unreadLabel` before its title for screen readers. Its list has the role `list`.
 */
@Component({
  selector: 'pl-announcement-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    role: 'listitem',
    '[attr.data-unread]': "unread() ? '' : null",
    '[attr.data-current]': "current() ? '' : null",
  },
  templateUrl: './announcement-row.html',
  styleUrl: './announcement-row.scss',
})
export class AnnouncementRow {
  private readonly locale = inject(LOCALE_ID)

  readonly heading = input.required<string>()
  readonly summary = input<string>()
  readonly date = input.required<Date | string>()
  /** Its kind, in the same neutral color for every kind. */
  readonly icon = input.required<IconName>()
  readonly unread = input(false, { transform: booleanAttribute })
  /** Read before the title of an unread announcement, such as « Non lue : ». */
  readonly unreadLabel = input<string>()
  readonly current = input(false, { transform: booleanAttribute })
  readonly chosen = output<void>()

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button')

  protected readonly dateTime = computed(() => new Date(this.date()).toISOString())
  protected readonly day = computed(() => shortCalendarDay(this.date(), this.locale))

  focus(): void {
    this.button().nativeElement.focus()
  }
}
