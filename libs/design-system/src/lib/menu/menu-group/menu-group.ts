import { ChangeDetectionStrategy, Component, input } from '@angular/core'

let lastGroupId = 0

/**
 * A set of exclusive choices in a menu, named by `label` and drawn as a segmented choice, such as
 * the theme. Its entries are `menuitemradio`: the arrows reach them like any other entry, which a
 * `radiogroup` inside a menu would not allow.
 */
@Component({
  selector: 'pl-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-menu-group',
    role: 'group',
    '[attr.aria-labelledby]': 'labelId',
  },
  templateUrl: './menu-group.html',
  styleUrl: './menu-group.scss',
})
export class MenuGroup {
  readonly label = input.required<string>()
  protected readonly labelId = `pl-menu-group-${++lastGroupId}`
}
