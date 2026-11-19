import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'

/**
 * `popover`: a box beside what opened it, closed by a cross.
 * `screen`: the whole screen of a phone, under a bar in the colors of the cover, closed by a back arrow.
 */
export type PanelLayout = 'popover' | 'screen'

let lastId = 0

/**
 * A panel opened over the page with the Angular CDK `Dialog` (focus trap, Escape, focus return), and
 * labelled by its title through `headingId`. Actions on its whole content go in `plPanelActions`, in
 * the head; on a phone, those within reach of the thumb go in `plPanelTools`, under the bar.
 */
@Component({
  selector: 'pl-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  host: { '[attr.data-layout]': 'layout()' },
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  readonly heading = input.required<string>()
  /** The name of the button that closes it, such as « Fermer les notifications ». */
  readonly closeLabel = input.required<string>()
  readonly layout = input<PanelLayout>('popover')
  /** Id of the title, to pass as `ariaLabelledBy` when opening the dialog. */
  readonly headingId = input(`pl-panel-title-${++lastId}`)

  readonly closed = output<void>()

  private readonly closeButton = viewChild<string, ElementRef<HTMLButtonElement>>('close', { read: ElementRef })

  /** Gives the focus to the button that closes the panel, when what held it has gone. */
  focusClose(): void {
    this.closeButton()?.nativeElement.focus()
  }
}
