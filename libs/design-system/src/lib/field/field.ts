import { ChangeDetectionStrategy, Component, booleanAttribute, contentChild, input } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { FieldInput } from './field-input'

/**
 * A labelled text field: its label, with an aside on its right (`plFieldAside`, such as a link), then a
 * box that holds `input[plInput]` and, after it, a button such as `plPasswordReveal`. The box shows the
 * focus and the error of its input; the message that explains an error belongs to the page, which
 * links it through the input's `aria-describedby`. A field whose purpose shows otherwise (a search
 * box with its icon and its placeholder) keeps its label for screen readers only, without an aside.
 */
@Component({
  selector: 'pl-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    '[attr.data-invalid]': "control()?.invalid() ? '' : null",
    '[attr.data-focused]': "control()?.focused() ? '' : null",
  },
  templateUrl: './field.html',
  styleUrl: './field.scss',
})
export class Field {
  readonly label = input.required<string>()
  /** Read by screen readers only. */
  readonly labelHidden = input(false, { transform: booleanAttribute })
  /** Before the control, such as `search`. */
  readonly icon = input<IconName>()
  readonly control = contentChild(FieldInput)
}
