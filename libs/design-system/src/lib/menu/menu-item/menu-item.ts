import { MenuItem as AriaMenuItem } from '@angular/aria/menu'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Glyph, GlyphName } from '../../glyph/glyph'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'
import { MenuItemTone } from '../menu'

let lastItemId = 0

/**
 * An entry of a menu: an icon, a title and, when it helps, a line of description. One of a set of
 * exclusive choices takes `role="menuitemradio"` and `checked`, inside a `pl-menu-group`.
 */
@Component({
  selector: 'pl-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Glyph, Icon],
  hostDirectives: [{ directive: AriaMenuItem, inputs: ['value', 'disabled', 'role'] }],
  host: {
    class: 'pl-menu-item',
    '[attr.data-tone]': 'tone()',
    '[attr.aria-checked]': 'checked() === undefined ? null : checked()',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.aria-describedby]': 'description() ? descriptionId : null',
  },
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.scss',
})
export class MenuItem {
  readonly icon = input<IconName>()
  /** A PLaTon glyph at 40 px instead of the icon, for a choice of object (the Create menu). */
  readonly glyph = input<GlyphName>()
  /** `danger` for an entry that destroys something (« Supprimer la section »). */
  readonly tone = input<MenuItemTone>('default')
  /** Read after the title, as the entry's description. */
  readonly description = input<string>()
  /** Whether a `menuitemradio` or `menuitemcheckbox` entry is on. */
  readonly checked = input<boolean>()

  private readonly id = ++lastItemId
  protected readonly titleId = `pl-menu-item-title-${this.id}`
  protected readonly descriptionId = `pl-menu-item-description-${this.id}`
}
