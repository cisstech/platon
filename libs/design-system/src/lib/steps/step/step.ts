import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core'

/**
 * A step: its number, its heading (a level 3, under the heading of its card), why, and what to do
 * with `plStepAction`. The step to take now is `current`, which its number says in the primary color
 * and assistive technologies in words.
 */
@Component({
  selector: 'pl-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'listitem', '[attr.aria-current]': "current() ? 'step' : null" },
  templateUrl: './step.html',
  styleUrl: './step.scss',
})
export class Step {
  readonly heading = input.required<string>()
  readonly current = input(false, { transform: booleanAttribute })
}
