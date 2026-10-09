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
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'
import { Skeleton } from '../skeleton/skeleton'
import { IconName } from '../icon/icon-names'
import { relativeTime } from '../time/relative-time'

let lastId = 0

/** A list of notifications, newest first. */
@Component({
  selector: 'pl-notification-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class NotificationList {}

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
  template: `
    <span class="pl-notification-item__lead" [attr.data-hue]="hue() ?? null"><pl-icon [name]="icon()" /></span>
    <div class="pl-notification-item__body">
      @if (href(); as href) {
      <a
        class="pl-notification-item__main"
        #main
        [href]="href"
        (click)="chosen.emit($event)"
        (auxclick)="chooseAside($event)"
      >
        <ng-container [ngTemplateOutlet]="text" />
      </a>
      } @else if (choosable()) {
      <button type="button" class="pl-notification-item__main" #main (click)="chosen.emit($event)">
        <ng-container [ngTemplateOutlet]="text" />
      </button>
      } @else {
      <div class="pl-notification-item__main" #main tabindex="-1"><ng-container [ngTemplateOutlet]="text" /></div>
      }
      <div class="pl-notification-item__actions"><ng-content select="[plNotificationActions]" /></div>
    </div>
    <ng-template #text>
      <span class="pl-notification-item__title" [id]="titleId()">
        @if (unread() && unreadLabel()) {
        <span class="pl-visually-hidden">{{ unreadLabel() }}{{ ' ' }}</span>
        }
        {{ heading() }}
      </span>
      {{ ' ' }}
      <span class="pl-notification-item__detail">
        @if (context()) { {{ context() }}, }
        <time [attr.datetime]="dateTime()">{{ when() }}</time>
      </span>
    </ng-template>
  `,
  styles: `
    :host {
      position: relative;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--pl-space-3);
      min-block-size: 64px;
      padding: var(--pl-space-3) var(--pl-space-4) var(--pl-space-3) var(--pl-space-6);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    :host + :host {
      border-block-start: 1px solid var(--pl-color-line);
    }
    :host([data-unread]) {
      background: var(--pl-color-surface-muted);
    }
    :host([data-unread])::before {
      content: '';
      position: absolute;
      inset-block-start: 19px;
      inset-inline-start: 10px;
      inline-size: 8px;
      block-size: 8px;
      border-radius: var(--pl-radius-pill);
      background: var(--pl-color-text);
    }
    :host([data-choosable]:hover) {
      background: var(--pl-color-hover);
    }
    .pl-notification-item__lead {
      display: grid;
      place-items: center;
      inline-size: 36px;
      block-size: 36px;
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-hover);
      color: var(--pl-color-muted);
    }
    .pl-notification-item__lead[data-hue] {
      background: var(--pl-hue-tint);
      color: var(--pl-hue-ink);
    }
    .pl-notification-item__body {
      display: grid;
      gap: var(--pl-space-2);
      min-inline-size: 0;
    }
    .pl-notification-item__main {
      display: grid;
      color: inherit;
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    button.pl-notification-item__main {
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    /* The link or the button covers the row; the actions sit above it, later in the document. */
    :is(a, button).pl-notification-item__main::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    .pl-notification-item__main:focus-visible {
      outline: none;
    }
    /* A row that only informs takes the focus from the page alone, after the element that held it went. */
    .pl-notification-item__main:focus-visible::after {
      content: '';
      position: absolute;
      inset: 0;
      outline: 2px solid var(--pl-color-focus);
      outline-offset: -2px;
    }
    :host([data-unread]) .pl-notification-item__title {
      font-weight: var(--pl-weight-strong);
    }
    .pl-notification-item__detail {
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
    }
    .pl-notification-item__actions {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: var(--pl-space-2);
    }
    .pl-notification-item__actions:empty {
      display: none;
    }
  `,
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
    return this.context() ? words : words.charAt(0).toLocaleUpperCase(this.locale) + words.slice(1)
  })
}

/** A notification on its way, in the shape of a row. */
@Component({
  selector: 'pl-notification-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  template: `
    <pl-skeleton shape="button" width="36px" />
    <div class="pl-notification-skeleton__text"><pl-skeleton width="85%" /><pl-skeleton width="45%" /></div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--pl-space-3);
      min-block-size: 64px;
      padding: var(--pl-space-3) var(--pl-space-4) var(--pl-space-3) var(--pl-space-6);
    }
    .pl-notification-skeleton__text {
      display: grid;
      align-content: start;
      gap: var(--pl-space-2);
    }
  `,
})
export class NotificationSkeleton {}
