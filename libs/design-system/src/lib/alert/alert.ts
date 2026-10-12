import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

/**
 * A message in the flow of the page: a heading in bold, a sentence, and an action when it helps
 * (`plAlertAction`). With a `dismissLabel`, it closes on a button so named; the page removes it and
 * moves the focus on.
 * `neutral` for a wait or a piece of news, never alarming; the other tones follow the state colors.
 */
@Component({
  selector: 'pl-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  host: { '[attr.data-tone]': 'tone()' },
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  readonly tone = input<AlertTone>('neutral')
  readonly icon = input<IconName>()
  readonly heading = input<string>()
  /** Names the button that closes it; without, it does not close. */
  readonly dismissLabel = input<string>()
  readonly dismissed = output<void>()
}
