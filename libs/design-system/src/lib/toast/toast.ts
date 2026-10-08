import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { Tooltip } from '../tooltip/tooltip'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'loading'

/** A confirmation takes `check`, not the icon of success: staying is not succeeding. */
const TONE_ICONS: Record<Exclude<ToastTone, 'loading'>, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'error',
}

/**
 * A short message floating over the page, on the color of the cover. Its tone comes with an icon,
 * never with color alone; a confirmation or an information stays neutral. It may carry one action,
 * such as « Annuler ».
 */
@Component({
  selector: 'pl-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, NgTemplateOutlet, Tooltip],
  host: {
    class: 'pl-toast',
    '[attr.data-tone]': 'tone()',
  },
  template: `
    @if (icon(); as icon) {
    <pl-icon class="pl-toast__icon" [name]="icon" [size]="3" />
    } @else {
    <span class="pl-toast__spinner" aria-hidden="true"></span>
    }
    <div class="pl-toast__body">
      @if (title()) {
      <p class="pl-toast__title">{{ title() }}</p>
      } @if (message()) {
      <p class="pl-toast__message">{{ message() }}</p>
      } @if (template(); as template) {
      <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context()" />
      }
    </div>
    @if (actionLabel(); as actionLabel) {
    <button type="button" plButton variant="ghost" size="sm" class="pl-toast__action" (click)="acted.emit()">
      @if (actionIcon(); as actionIcon) {
      <pl-icon [name]="actionIcon" />
      }
      {{ actionLabel }}
    </button>
    } @if (dismissLabel(); as dismissLabel) {
    <button
      type="button"
      plButton
      variant="icon"
      size="sm"
      class="pl-toast__dismiss"
      [plTooltip]="dismissLabel"
      (click)="dismissed.emit()"
    >
      <pl-icon name="close" />
    </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--pl-space-3);
      max-inline-size: min(520px, 100%);
      padding: var(--pl-space-2) var(--pl-space-2) var(--pl-space-2) var(--pl-space-4);
      border-radius: var(--pl-radius-3);
      background: var(--pl-color-cover);
      box-shadow: var(--pl-shadow-overlay);
      color: var(--pl-color-cover-text);
      font: var(--pl-font-body);
    }
    .pl-toast__icon {
      color: var(--pl-color-cover-muted);
    }
    :host([data-tone='warning']) .pl-toast__icon {
      color: var(--pl-color-cover-warning);
    }
    :host([data-tone='danger']) .pl-toast__icon {
      color: var(--pl-color-cover-danger);
    }
    .pl-toast__spinner {
      flex: none;
      inline-size: var(--pl-icon-size-3);
      block-size: var(--pl-icon-size-3);
      border: 2px solid var(--pl-color-cover-line);
      border-block-start-color: var(--pl-color-cover-primary);
      border-radius: var(--pl-radius-pill);
      animation: pl-toast-spin var(--pl-duration-joy) linear infinite;
    }
    .pl-toast__body {
      display: grid;
      flex: 1;
      gap: var(--pl-space-1);
      min-inline-size: 0;
      padding-block: var(--pl-space-1);
      overflow-wrap: anywhere;
    }
    .pl-toast__title {
      font: var(--pl-font-subheading);
    }
    .pl-toast__title + .pl-toast__message {
      color: var(--pl-color-cover-muted);
    }
    :host .pl-toast__action {
      color: var(--pl-color-cover-primary);
    }
    :host .pl-toast__dismiss {
      color: var(--pl-color-cover-muted);
    }
    :host .pl-toast__action:hover,
    :host .pl-toast__dismiss:hover {
      background: var(--pl-color-cover-raised);
      color: var(--pl-color-cover-text);
    }
    @keyframes pl-toast-spin {
      to {
        transform: rotate(1turn);
      }
    }
  `,
})
export class Toast {
  readonly tone = input<ToastTone>('info')
  readonly title = input<string>()
  readonly message = input<string>()
  /** Rendered under the message, with `context`. */
  readonly template = input<TemplateRef<unknown>>()
  readonly context = input<unknown>()
  /** Label of the one action the toast carries, such as « Annuler ». */
  readonly actionLabel = input<string>()
  readonly actionIcon = input<IconName>()
  /** Accessible name of the close button; without it, the toast has no close button. */
  readonly dismissLabel = input<string>()
  readonly acted = output<void>()
  readonly dismissed = output<void>()

  protected readonly icon = computed(() => {
    const tone = this.tone()
    return tone === 'loading' ? null : TONE_ICONS[tone]
  })
}
