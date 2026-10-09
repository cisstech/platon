import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * `inline`: next to a label (navigation entry, tab, section title), read with it.
 * `badge`: on an icon button, hidden from assistive technologies: the button's name says the count.
 */
export type CountVariant = 'inline' | 'badge'

/**
 * A number next to what it counts. A surface with other colors (the cover, an active entry) styles
 * `pl-count` from its own stylesheet, which wins over the defaults below.
 */
@Component({
  selector: 'pl-count',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.aria-hidden]': "variant() === 'badge' ? 'true' : null",
  },
  template: `{{ value() }}`,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      min-inline-size: 22px;
      block-size: 20px;
      padding: 0 var(--pl-space-1);
      border-radius: var(--pl-radius-1);
      background: var(--pl-color-hover);
      color: var(--pl-color-muted);
      font: var(--pl-font-caption);
      font-variant-numeric: tabular-nums;
      text-align: center;
    }
    :host([data-variant='badge']) {
      position: absolute;
      inset-block-start: 2px;
      inset-inline-end: 0;
      min-inline-size: var(--pl-icon-size-1);
      block-size: var(--pl-icon-size-1);
      border-radius: var(--pl-radius-pill);
      background: var(--pl-color-cover-primary);
      color: var(--pl-color-cover-primary-text);
    }
  `,
})
export class Count {
  readonly value = input.required<number>()
  readonly variant = input<CountVariant>('inline')
}
