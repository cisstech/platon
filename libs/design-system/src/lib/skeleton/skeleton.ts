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
  template: '',
  styles: `
    :host {
      display: block;
      block-size: var(--pl-space-3);
      border-radius: var(--pl-radius-1);
      background: linear-gradient(
        90deg,
        var(--pl-color-skeleton) 0%,
        var(--pl-color-skeleton-shine) 50%,
        var(--pl-color-skeleton) 100%
      );
      background-size: 200% 100%;
      animation: pl-skeleton var(--pl-duration-shimmer) ease-in-out infinite;
    }
    :host([data-shape='heading']) {
      block-size: var(--pl-space-4);
    }
    :host([data-shape='button']) {
      inline-size: 96px;
      block-size: 36px;
      border-radius: var(--pl-radius-control);
    }
    @keyframes pl-skeleton {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: -100% 0;
      }
    }
  `,
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('line')
  /** A CSS width, such as `60%`; the full width by default. */
  readonly width = input<string>()
}
