import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { IconName } from './icon-names'
import { ICON_SPRITE_URL } from './icon-sprite'

/** A step of the `--pl-icon-size-*` scale: 16, 18, 20 and 24 px. */
export type IconSize = 1 | 2 | 3 | 4

const SIZES: Record<IconSize, string> = {
  1: 'var(--pl-icon-size-1)',
  2: 'var(--pl-icon-size-2)',
  3: 'var(--pl-icon-size-3)',
  4: 'var(--pl-icon-size-4)',
}

/**
 * A Material Symbols Rounded icon of the sprite, in the color of the text around it.
 * Decorative unless it has a `label`: an icon that carries meaning on its own must be named.
 */
@Component({
  selector: 'pl-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-icon',
    '[style.--pl-icon-size]': 'sizeToken()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  template: `<svg focusable="false"><use [attr.href]="href()" /></svg>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      inline-size: var(--pl-icon-size, 1em);
      block-size: var(--pl-icon-size, 1em);
      vertical-align: -0.125em;
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
      fill: currentColor;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>()
  /** Without a size, the icon follows the font size around it. */
  readonly size = input<IconSize>()
  /** Accessible name, for an icon shown without a text that says the same thing. */
  readonly label = input<string>()

  protected readonly href = computed(() => `${ICON_SPRITE_URL}#${this.name()}`)
  protected readonly sizeToken = computed(() => {
    const size = this.size()
    return size ? SIZES[size] : null
  })
}
