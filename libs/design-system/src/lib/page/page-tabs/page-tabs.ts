import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * The tabs of a page, when each one has its own address: a navigation named by `label`. Tabs that
 * switch a panel without changing the address are the tabs of Angular Aria.
 */
@Component({
  selector: 'pl-page-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-page-tabs',
    role: 'navigation',
    '[attr.aria-label]': 'label()',
  },
  templateUrl: './page-tabs.html',
  styleUrl: './page-tabs.scss',
})
export class PageTabs {
  readonly label = input.required<string>()
}
