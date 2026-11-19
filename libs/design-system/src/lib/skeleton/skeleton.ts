import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** `line`: a line of text; `heading`: a title; `button`: the place of a button. */
export type SkeletonShape = 'line' | 'heading' | 'button'

/**
 * The shape of content that is on its way. Used only for the data the page waits for: what the
 * client already knows (titles, name, date) shows at once.
 */
@Component({
  selector: 'pl-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[style.inline-size]': 'width()',
  },
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('line')
  /** A CSS width, such as `60%`; the full width by default. */
  readonly width = input<string>()
}
