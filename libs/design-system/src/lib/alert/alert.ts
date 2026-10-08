import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

/**
 * A message in the flow of the page: a heading in bold, a sentence, and an action when it helps
 * (`plAlertAction`).
 * `neutral` for a wait or a piece of news, never alarming; the other tones follow the state colors.
 */
@Component({
  selector: 'pl-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { '[attr.data-tone]': 'tone()' },
  template: `
    @if (icon(); as icon) {
    <pl-icon class="pl-alert__icon" [name]="icon" [size]="3" />
    }
    <div class="pl-alert__body">
      @if (heading()) {
      <strong class="pl-alert__heading">{{ heading() }}</strong>
      }
      <ng-content />
    </div>
    <div class="pl-alert__action"><ng-content select="[plAlertAction]" /></div>
  `,
  styles: `
    :host {
      display: flex;
      gap: var(--pl-space-3);
      padding: var(--pl-space-3) var(--pl-space-4);
      border: 1px solid var(--pl-color-line);
      border-radius: var(--pl-radius-3);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    .pl-alert__icon {
      margin-block-start: 1px;
      color: var(--pl-color-muted);
    }
    .pl-alert__body {
      display: grid;
      flex: 1;
      gap: var(--pl-space-1);
    }
    .pl-alert__heading {
      font-weight: var(--pl-weight-strong);
    }
    .pl-alert__action {
      align-self: center;
    }
    .pl-alert__action:empty {
      display: none;
    }
    :host([data-tone='info']) {
      border-color: var(--pl-color-info-line);
      background: var(--pl-color-info-soft);
      color: var(--pl-color-info-ink);
    }
    :host([data-tone='success']) {
      border-color: var(--pl-color-success-line);
      background: var(--pl-color-success-soft);
      color: var(--pl-color-success-ink);
    }
    :host([data-tone='warning']) {
      border-color: var(--pl-color-warning-line);
      background: var(--pl-color-warning-soft);
      color: var(--pl-color-warning-ink);
    }
    :host([data-tone='danger']) {
      border-color: var(--pl-color-danger-line);
      background: var(--pl-color-danger-soft);
      color: var(--pl-color-danger-ink);
    }
    :host([data-tone='info']) .pl-alert__icon,
    :host([data-tone='success']) .pl-alert__icon,
    :host([data-tone='warning']) .pl-alert__icon {
      color: inherit;
    }
    :host([data-tone='danger']) .pl-alert__icon {
      color: var(--pl-color-danger);
    }
  `,
})
export class Alert {
  readonly tone = input<AlertTone>('neutral')
  readonly icon = input<IconName>()
  readonly heading = input<string>()
}
