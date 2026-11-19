import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { Button } from '../button/button'

export type DialogTone = 'default' | 'danger'

let lastId = 0

/**
 * The frame of a dialog: its title, its content, and the two actions that close it. Opened with the
 * Angular CDK `Dialog`, which brings the modal behavior (focus trap, Escape, focus return), and
 * labelled by its title through `headingId`.
 */
@Component({
  selector: 'pl-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  host: {
    class: 'pl-dialog',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  readonly heading = input.required<string>()
  readonly confirmLabel = input.required<string>()
  readonly cancelLabel = input.required<string>()
  /** `danger` when confirming destroys or loses something. */
  readonly tone = input<DialogTone>('default')
  readonly confirmDisabled = input(false)
  /** Id of the title, to pass as `ariaLabelledBy` when opening the dialog. */
  readonly headingId = input(`pl-dialog-title-${++lastId}`)

  readonly confirmed = output<void>()
  readonly cancelled = output<void>()
}
