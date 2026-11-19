import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Icon } from '../../icon/icon'

/** The quiet mention at the very bottom of the cover, such as « Logiciel libre, par cisstech ». */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plCoverCredit]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-cover-credit' },
  templateUrl: './cover-credit.html',
  styleUrl: './cover-credit.scss',
})
export class CoverCredit {}
