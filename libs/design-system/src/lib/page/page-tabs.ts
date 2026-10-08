import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLinkActive } from '@angular/router'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

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
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      gap: var(--pl-space-1);
      overflow-x: auto;
      border-block-end: 1px solid var(--pl-color-line);
      scrollbar-width: none;
    }
  `,
})
export class PageTabs {
  readonly label = input.required<string>()
}

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
  template: `
    @if (icon(); as icon) {
    <pl-icon [name]="icon" [size]="2" />
    }
    <ng-content />
    @if (count() !== undefined) {
    <span class="pl-page-tab__count">{{ count() }}</span>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: var(--pl-space-2);
      block-size: 40px;
      padding: 0 var(--pl-space-3);
      color: var(--pl-color-muted);
      font: var(--pl-font-body);
      font-weight: var(--pl-weight-strong);
      text-decoration: none;
      transition: color var(--pl-duration-hover) var(--pl-ease-standard);
    }
    :host(:hover) {
      color: var(--pl-color-text);
    }
    :host([aria-current='page']) {
      color: var(--pl-color-primary);
    }
    :host([aria-current='page'])::after {
      position: absolute;
      inset-inline: var(--pl-space-3);
      inset-block-end: -1px;
      block-size: 2px;
      background: var(--pl-color-primary);
      content: '';
    }
    :host(:focus-visible) {
      outline-offset: -2px;
    }
    .pl-page-tab__count {
      color: var(--pl-color-subtle);
      font: var(--pl-font-caption);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class PageTab {
  readonly icon = input<IconName>()
  readonly count = input<number>()

  constructor() {
    inject(RouterLinkActive, { self: true }).ariaCurrentWhenActive = 'page'
  }
}
