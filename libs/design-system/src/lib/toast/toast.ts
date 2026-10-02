import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'loading'

const TONE_ICONS: Record<Exclude<ToastTone, 'loading'>, IconName> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
}

/** A short message about what just happened. Its tone always comes with an icon, never color alone. */
@Component({
  selector: 'pl-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, NgTemplateOutlet],
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
    @if (dismissLabel()) {
    <button type="button" class="pl-toast__dismiss" [attr.aria-label]="dismissLabel()" (click)="dismissed.emit()">
      <pl-icon name="close" [size]="1" />
    </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--pl-space-3);
      inline-size: min(360px, 100%);
      padding: var(--pl-space-3) var(--pl-space-3) var(--pl-space-3) var(--pl-space-4);
      border: 1px solid var(--pl-color-line);
      border-radius: var(--pl-radius-card);
      background: var(--pl-color-surface-raised);
      box-shadow: var(--pl-shadow-float);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    .pl-toast__icon,
    .pl-toast__spinner {
      margin-block-start: 1px;
    }
    :host([data-tone='info']) .pl-toast__icon {
      color: var(--pl-color-info-ink);
    }
    :host([data-tone='success']) .pl-toast__icon {
      color: var(--pl-color-success-ink);
    }
    :host([data-tone='warning']) .pl-toast__icon {
      color: var(--pl-color-warning-ink);
    }
    :host([data-tone='danger']) .pl-toast__icon {
      color: var(--pl-color-danger-ink);
    }
    .pl-toast__spinner {
      flex: none;
      inline-size: var(--pl-icon-size-3);
      block-size: var(--pl-icon-size-3);
      border: 2px solid var(--pl-color-line-strong);
      border-block-start-color: var(--pl-color-primary);
      border-radius: var(--pl-radius-pill);
      animation: pl-toast-spin var(--pl-duration-joy) linear infinite;
    }
    .pl-toast__body {
      display: grid;
      flex: 1;
      gap: var(--pl-space-1);
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }
    .pl-toast__title {
      font: var(--pl-font-subheading);
    }
    .pl-toast__message {
      color: var(--pl-color-text);
    }
    .pl-toast__title + .pl-toast__message {
      color: var(--pl-color-muted);
    }
    .pl-toast__dismiss {
      display: inline-flex;
      flex: none;
      padding: var(--pl-space-1);
      border: 0;
      border-radius: var(--pl-radius-control);
      background: transparent;
      color: var(--pl-color-muted);
      cursor: pointer;
      transition: background-color var(--pl-duration-hover) var(--pl-ease-standard);
    }
    .pl-toast__dismiss:hover {
      background: var(--pl-color-surface-muted);
      color: var(--pl-color-text);
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
  /** Accessible name of the close button; without it, the toast has no close button. */
  readonly dismissLabel = input<string>()
  readonly dismissed = output<void>()

  protected readonly icon = computed(() => {
    const tone = this.tone()
    return tone === 'loading' ? null : TONE_ICONS[tone]
  })
}
