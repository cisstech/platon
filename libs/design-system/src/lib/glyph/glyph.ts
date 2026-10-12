import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** The five objects of PLaTon, drawn in the style of the illustrations. */
export type GlyphName = 'course' | 'activity' | 'exercise' | 'circle' | 'paper'

/** A step of the `--pl-glyph-size-*` scale: 40 and 56 px. */
export type GlyphSize = 1 | 2

/**
 * A PLaTon glyph, for the large sizes: empty states, the Create menu, the choice of an object to
 * create. Its colors are roles of the tokens, so it follows the theme. Decorative unless it has a
 * `label`.
 */
@Component({
  selector: 'pl-glyph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  templateUrl: './glyph.html',
  styleUrl: './glyph.scss',
})
export class Glyph {
  readonly name = input.required<GlyphName>()
  readonly size = input<GlyphSize>(1)
  readonly label = input<string>()
}
