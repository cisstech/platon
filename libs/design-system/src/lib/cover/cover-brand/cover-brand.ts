import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { LOGO_URL } from '../cover'

/** The link to the home at the top of the cover: the logo, the name (the content) and the institution. */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plCoverBrand]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-cover-brand' },
  templateUrl: './cover-brand.html',
  styleUrl: './cover-brand.scss',
})
export class CoverBrand {
  readonly institution = input<string>()
  protected readonly logoUrl = LOGO_URL
}
