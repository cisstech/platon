import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'

/** An entry of a sheet, on a link or a button: an icon, the label, and a trailing icon when it helps. */
@Component({
  // A component on a native link or button: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plSheetItem], button[plSheetItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-sheet-item' },
  templateUrl: './sheet-item.html',
  styleUrl: './sheet-item.scss',
})
export class SheetItem {
  readonly icon = input.required<IconName>()
  readonly trailing = input<IconName>()
}
