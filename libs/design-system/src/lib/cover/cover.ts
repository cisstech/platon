import { CdkScrollable } from '@angular/cdk/scrolling'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** `sidebar`: beside the page on a wide screen. `panel`: opened over the page on a narrow one, with 44 px entries. */
export type CoverLayout = 'sidebar' | 'panel'

/**
 * The cover of the application, on the left of every page: always dark, in both themes, like the
 * cover of a notebook. From top to bottom: the brand (`plCoverBrand`, with `plCoverClose` beside it
 * in a panel), the main action (`plCoverAction`), the navigation (`pl-cover-nav`) and the foot
 * (`pl-cover-foot`). As a sidebar it is the banner of the application: logo, navigation and account.
 * It scrolls on its own, and tells the CDK, so that a menu opened from it follows.
 */
@Component({
  selector: 'pl-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkScrollable],
  host: {
    class: 'pl-cover',
    '[attr.role]': "layout() === 'sidebar' ? 'banner' : null",
    '[attr.data-layout]': 'layout()',
  },
  templateUrl: './cover.html',
  styleUrl: './cover.scss',
})
export class Cover {
  readonly layout = input<CoverLayout>('sidebar')
}

/** The PLaTon logo: the tilted tile and its gradient, from magenta to orange. */
export const LOGO_URL = 'assets/design-system/logo.svg'
