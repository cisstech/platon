import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/**
 * A moment of joy, such as a first welcome: an icon in the warmth of the logo, lit once when it
 * appears. The warmth stays on the icon; the words keep the color of the text.
 */
@Component({
  selector: 'pl-joy-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { 'aria-hidden': 'true' },
  templateUrl: './joy-mark.html',
  styleUrl: './joy-mark.scss',
})
export class JoyMark {
  readonly icon = input<IconName>('auto_awesome')
}
