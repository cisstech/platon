import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'

/** A line of a sheet that holds a control, such as the choice of the theme: its label, then the control. */
@Component({
  selector: 'pl-sheet-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-sheet-field' },
  templateUrl: './sheet-field.html',
  styleUrl: './sheet-field.scss',
})
export class SheetField {
  readonly label = input.required<string>()
  readonly icon = input<IconName>()
}
