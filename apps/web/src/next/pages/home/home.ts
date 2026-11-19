import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { withUiParam } from '../../../ui-switch/ui-url'

/** Home of the new interface, until the real one. */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  /** Same address in the current interface, kept as the preference. */
  protected readonly legacyHref = withUiParam(new URL(inject(DOCUMENT).location.href), 'legacy')
}
