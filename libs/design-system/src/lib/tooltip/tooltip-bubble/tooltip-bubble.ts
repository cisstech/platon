import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'pl-tooltip-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  templateUrl: './tooltip-bubble.html',
  styleUrl: './tooltip-bubble.scss',
})
export class TooltipBubble {
  readonly text = input('')
}
