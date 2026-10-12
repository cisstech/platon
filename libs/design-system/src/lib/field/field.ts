import { ChangeDetectionStrategy, Component, contentChild, input } from '@angular/core'
import { FieldInput } from './field-input'

/**
 * A labelled text field: its label, with an aside on its right (`plFieldAside`, such as a link), then a
 * box that holds `input[plInput]` and, after it, a button such as `plPasswordReveal`. The box shows the
 * focus and the error of its input; the message that explains an error belongs to the page, which
 * links it through the input's `aria-describedby`.
 */
@Component({
  selector: 'pl-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-invalid]': "control()?.invalid() ? '' : null",
    '[attr.data-focused]': "control()?.focused() ? '' : null",
  },
  templateUrl: './field.html',
  styleUrl: './field.scss',
})
export class Field {
  readonly label = input.required<string>()
  readonly control = contentChild(FieldInput)
}
