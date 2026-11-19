import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core'
import { Glyph, GlyphName } from '../glyph/glyph'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/** The color of the pastille: `neutral` when nothing can be created, `danger` for an error. */
export type EmptyTone = 'neutral' | 'danger'

/**
 * A place with nothing in it, or a place that failed, on a card: a figure, a heading, why, and what
 * to do.
 * The figure is the blank paper illustration by default, the glyph of the object it would hold with
 * `glyph`, or an icon in a pastille with `icon`, when there is nothing to create. The text goes in
 * the content, the actions with `plEmptyAction`. An error takes `role="alert"`; a page error shows its
 * `code` in small.
 */
@Component({
  selector: 'pl-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Glyph, Icon],
  host: {
    class: 'pl-empty',
    '[attr.data-figure]': "icon() ? 'icon' : glyph() ? 'glyph' : 'illustration'",
    '[attr.data-compact]': "compact() ? '' : null",
  },
  templateUrl: './empty.html',
  styleUrl: './empty.scss',
})
export class Empty {
  readonly heading = input.required<string>()
  /** Level of the heading: 2 for a page or a card, 3 for a zone under a section title. */
  readonly level = input<2 | 3>(2)
  readonly glyph = input<GlyphName>()
  readonly icon = input<IconName>()
  readonly tone = input<EmptyTone>('neutral')
  /** The code of a page error, such as « Erreur 503 », in small under the actions. */
  readonly code = input<string>()
  /** The smaller form, inside a zone of a page. */
  readonly compact = input(false, { transform: booleanAttribute })
}
