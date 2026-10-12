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
  templateUrl: './count.html',
  styleUrl: './count.scss',
})
export class Count {
  readonly value = input.required<number>()
  readonly variant = input<CountVariant>('inline')
}
