import { ChangeDetectionStrategy, Component, output } from '@angular/core'
import { Button, Empty } from '@platon/design-system'

/** What the overview says when its search or its state leaves no activity, with a way back to all. */
@Component({
  selector: 'app-overview-none',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Empty],
  templateUrl: './overview-none.html',
})
export class OverviewNone {
  /** Asks for every activity again. */
  readonly cleared = output<void>()
}
