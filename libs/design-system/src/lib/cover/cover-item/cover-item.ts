import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLinkActive } from '@angular/router'
import { Count } from '../../count/count'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'

/**
 * An entry of the cover, on a link with its `routerLink` or on a button. The entry of the current
 * page, and of the pages under it, is a binder divider: it takes the color of the page and joins
 * it, and carries `aria-current="page"`. Its count is read with `countLabel` (« 2 copies à
 * corriger »).
 */
@Component({
  // A component on a native link or button: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plCoverItem], button[plCoverItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Count, Icon],
  hostDirectives: [{ directive: RouterLinkActive, inputs: ['routerLinkActiveOptions'] }],
  host: { class: 'pl-cover-item' },
  templateUrl: './cover-item.html',
  styleUrl: './cover-item.scss',
})
export class CoverItem {
  readonly icon = input.required<IconName>()
  readonly count = input<number>()
  /** What the count counts, read after it by screen readers. */
  readonly countLabel = input<string>()

  constructor() {
    inject(RouterLinkActive, { self: true }).ariaCurrentWhenActive = 'page'
  }
}
