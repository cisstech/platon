import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

export type DialogTone = 'default' | 'danger'

let lastId = 0

/**
 * The frame of a dialog: its title, its content, and the two actions that close it. Opened with the
 * Angular CDK `Dialog`, which brings the modal behavior (focus trap, Escape, focus return), and
 * labelled by its title through `headingId`.
 */
@Component({
  selector: 'pl-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-dialog',
    '[attr.data-tone]': 'tone()',
  },
  template: `
    <h2 class="pl-dialog__title" [id]="headingId()">{{ heading() }}</h2>
    <div class="pl-dialog__content"><ng-content /></div>
    <div class="pl-dialog__actions">
      <button type="button" class="pl-dialog__action" (click)="cancelled.emit()">{{ cancelLabel() }}</button>
      <button
        type="button"
        class="pl-dialog__action pl-dialog__action--confirm"
        [disabled]="confirmDisabled()"
        (click)="confirmed.emit()"
      >
        {{ confirmLabel() }}
      </button>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--pl-space-4);
      inline-size: min(480px, calc(100vw - 2 * var(--pl-space-4)));
      padding: var(--pl-space-6);
      border-radius: var(--pl-radius-card);
      background: var(--pl-color-surface-raised);
      box-shadow: var(--pl-shadow-overlay);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    .pl-dialog__title {
      font: var(--pl-font-heading);
    }
    .pl-dialog__content {
      display: grid;
      gap: var(--pl-space-3);
      font: var(--pl-font-reading);
      overflow-wrap: anywhere;
    }
    .pl-dialog__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--pl-space-2);
      margin-block-start: var(--pl-space-2);
    }
    .pl-dialog__action {
      min-block-size: var(--pl-space-10);
      padding: 0 var(--pl-space-4);
      border: 1px solid var(--pl-color-line-strong);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
      font-weight: var(--pl-weight-strong);
      cursor: pointer;
      transition: background-color var(--pl-duration-hover) var(--pl-ease-standard);
    }
    .pl-dialog__action:hover {
      background: var(--pl-color-surface-muted);
    }
    .pl-dialog__action--confirm {
      border-color: var(--pl-color-primary);
      background: var(--pl-color-primary);
      color: var(--pl-color-on-primary);
    }
    .pl-dialog__action--confirm:hover {
      border-color: var(--pl-color-primary-hover);
      background: var(--pl-color-primary-hover);
    }
    :host([data-tone='danger']) .pl-dialog__action--confirm {
      border-color: var(--pl-color-danger-strong);
      background: var(--pl-color-danger-strong);
      color: var(--pl-color-on-danger);
    }
    .pl-dialog__action:disabled {
      border-color: var(--pl-color-line);
      background: var(--pl-color-surface-muted);
      color: var(--pl-color-subtle);
      cursor: not-allowed;
    }
  `,
})
export class Dialog {
  readonly heading = input.required<string>()
  readonly confirmLabel = input.required<string>()
  readonly cancelLabel = input.required<string>()
  /** `danger` when confirming destroys or loses something. */
  readonly tone = input<DialogTone>('default')
  readonly confirmDisabled = input(false)
  /** Id of the title, to pass as `ariaLabelledBy` when opening the dialog. */
  readonly headingId = input(`pl-dialog-title-${++lastId}`)

  readonly confirmed = output<void>()
  readonly cancelled = output<void>()
}
