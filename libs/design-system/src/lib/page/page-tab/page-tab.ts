import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLinkActive } from '@angular/router'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'

/**
 * A tab of `pl-page-tabs`, on a link with its `routerLink`. The tab of the current address carries
 * `aria-current="page"`; `[routerLinkActiveOptions]="{ exact: true }"` keeps a parent address, such as
 * the overview, from staying current under its children.
 */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plPageTab]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  hostDirectives: [{ directive: RouterLinkActive, inputs: ['routerLinkActiveOptions'] }],
  host: { class: 'pl-page-tab' },
  templateUrl: './page-tab.html',
  styleUrl: './page-tab.scss',
})
export class PageTab {
  readonly icon = input<IconName>()
  readonly count = input<number>()

  constructor() {
    inject(RouterLinkActive, { self: true }).ariaCurrentWhenActive = 'page'
  }
}
