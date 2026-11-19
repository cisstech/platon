import { CdkScrollable } from '@angular/cdk/scrolling'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { RouterLinkActive } from '@angular/router'
import { Avatar, AvatarPerson } from '../avatar/avatar'
import { Count } from '../count/count'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

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
  template: `
    <div class="pl-cover__head">
      <div class="pl-cover__brand">
        <ng-content select="[plCoverBrand]" />
        <ng-content select="[plCoverClose]" />
      </div>
      <ng-content select="[plCoverAction]" />
    </div>
    <ng-content select="pl-cover-nav" />
    <ng-content select="pl-cover-foot" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--pl-space-1);
      block-size: 100%;
      padding: var(--pl-space-4) 0 var(--pl-space-4) var(--pl-space-3);
      overflow-y: auto;
      background: var(--pl-color-cover);
      color: var(--pl-color-cover-text);
      font: var(--pl-font-body);
      scrollbar-width: thin;
    }
    :host([data-layout='panel']) {
      --pl-cover-item-size: 44px;
    }
    .pl-cover__head {
      display: grid;
      gap: var(--pl-space-4);
      margin-block-end: var(--pl-space-3);
      margin-inline-end: var(--pl-space-3);
    }
    .pl-cover__brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--pl-space-2);
    }
  `,
})
export class Cover {
  readonly layout = input<CoverLayout>('sidebar')
}

/** The PLaTon logo: the tilted tile and its gradient, from magenta to orange. */
export const LOGO_URL = 'assets/design-system/logo.svg'

/** The link to the home at the top of the cover: the logo, the name (the content) and the institution. */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plCoverBrand]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-cover-brand' },
  template: `
    <img class="pl-cover-brand__logo" alt="" [src]="logoUrl" />
    <span class="pl-cover-brand__text">
      <span class="pl-cover-brand__name"><ng-content /></span>
      @if (institution()) {
      {{ ' ' }}<span class="pl-cover-brand__institution">{{ institution() }}</span>
      }
    </span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--pl-space-3);
      padding: var(--pl-space-1) var(--pl-space-2);
      border-radius: var(--pl-radius-control);
      color: inherit;
      text-decoration: none;
    }
    :host(:focus-visible) {
      outline-color: var(--pl-color-cover-primary);
    }
    .pl-cover-brand__logo {
      flex: none;
      inline-size: 36px;
      block-size: 36px;
    }
    .pl-cover-brand__text {
      display: grid;
      min-inline-size: 0;
    }
    .pl-cover-brand__name {
      font: var(--pl-font-subheading);
    }
    .pl-cover-brand__institution {
      color: var(--pl-color-cover-muted);
      font: var(--pl-font-caption);
    }
  `,
})
export class CoverBrand {
  readonly institution = input<string>()
  protected readonly logoUrl = LOGO_URL
}

/** The navigation of the cover, a landmark named by `label`. */
@Component({
  selector: 'pl-cover-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-cover-nav',
    role: 'navigation',
    '[attr.aria-label]': 'label()',
  },
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: calc(var(--pl-space-1) / 2);
    }
  `,
})
export class CoverNav {
  readonly label = input.required<string>()
}

/** The bottom of the cover: help, notifications, the profile and the credit. */
@Component({
  selector: 'pl-cover-foot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-cover-foot' },
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: calc(var(--pl-space-1) / 2);
      margin-block-start: auto;
      margin-inline-end: var(--pl-space-3);
      padding-block-start: var(--pl-space-3);
      border-block-start: 1px solid var(--pl-color-cover-line);
    }
  `,
})
export class CoverFoot {}

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
  template: `
    <pl-icon class="pl-cover-item__icon" [name]="icon()" [size]="3" />
    <span class="pl-cover-item__label"><ng-content /></span>
    @if (count()) {
    {{ ' ' }}<pl-count class="pl-cover-item__count" [value]="count() ?? 0" />
    @if (countLabel()) {
    <span class="pl-visually-hidden"> {{ countLabel() }}</span>
    } }
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--pl-space-3);
      block-size: var(--pl-cover-item-size, 38px);
      margin-inline-end: var(--pl-space-3);
      padding: 0 var(--pl-space-3);
      border: 0;
      border-radius: var(--pl-radius-menu);
      background: none;
      color: var(--pl-color-cover-text);
      font: var(--pl-font-body);
      text-align: start;
      text-decoration: none;
      cursor: pointer;
    }
    :host-context(.pl-cover-foot) {
      margin-inline-end: 0;
    }
    :host(:hover),
    :host([aria-expanded='true']) {
      background: var(--pl-color-cover-raised);
    }
    :host(:focus-visible) {
      outline-color: var(--pl-color-cover-primary);
      outline-offset: -2px;
    }
    .pl-cover-item__icon {
      color: var(--pl-color-cover-muted);
    }
    .pl-cover-item__label {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    pl-count.pl-cover-item__count {
      background: var(--pl-color-cover-raised);
      color: var(--pl-color-cover-text);
    }
    :host([aria-current='page']) {
      margin-inline-end: 0;
      border-radius: var(--pl-radius-menu) 0 0 var(--pl-radius-menu);
      background: var(--pl-color-ground);
      color: var(--pl-color-primary);
      font-weight: var(--pl-weight-strong);
    }
    :host([aria-current='page']) .pl-cover-item__icon {
      color: var(--pl-color-primary);
    }
    :host([aria-current='page']) pl-count.pl-cover-item__count {
      background: var(--pl-color-primary-soft-strong);
      color: var(--pl-color-primary);
    }
    :host([aria-current='page']:focus-visible) {
      outline-color: var(--pl-color-focus);
    }
    :host([aria-current='page'])::before,
    :host([aria-current='page'])::after {
      position: absolute;
      inset-inline-end: 0;
      inline-size: var(--pl-space-3);
      block-size: var(--pl-space-3);
      content: '';
    }
    :host([aria-current='page'])::before {
      inset-block-start: calc(-1 * var(--pl-space-3));
      background: radial-gradient(
        circle at 0 0,
        transparent calc(var(--pl-space-3) - 0.5px),
        var(--pl-color-ground) var(--pl-space-3)
      );
    }
    :host([aria-current='page'])::after {
      inset-block-end: calc(-1 * var(--pl-space-3));
      background: radial-gradient(
        circle at 0 100%,
        transparent calc(var(--pl-space-3) - 0.5px),
        var(--pl-color-ground) var(--pl-space-3)
      );
    }
  `,
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

/**
 * The person at the foot of the cover: avatar, name (the content) and, under it, the type of
 * account. Opens the profile menu.
 */
@Component({
  // A component on a native button: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[plCoverProfile]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Icon],
  host: { class: 'pl-cover-profile' },
  template: `
    <pl-avatar [person]="person()" />
    <span class="pl-cover-profile__text">
      <span class="pl-cover-profile__name"><ng-content /></span>
      @if (detail()) {
      {{ ' ' }}<span class="pl-cover-profile__detail">{{ detail() }}</span>
      }
    </span>
    <pl-icon class="pl-cover-profile__chevron" [name]="chevron()" [size]="1" />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--pl-space-3);
      margin-block-start: var(--pl-space-1);
      padding: var(--pl-space-2) var(--pl-space-3);
      border: 0;
      border-radius: var(--pl-radius-menu);
      background: none;
      color: var(--pl-color-cover-text);
      font: var(--pl-font-body);
      text-align: start;
      cursor: pointer;
    }
    :host(:hover),
    :host([aria-expanded='true']) {
      background: var(--pl-color-cover-raised);
    }
    :host(:focus-visible) {
      outline-color: var(--pl-color-cover-primary);
      outline-offset: -2px;
    }
    .pl-cover-profile__text {
      display: grid;
      flex: 1;
      min-inline-size: 0;
    }
    .pl-cover-profile__name {
      overflow: hidden;
      font-weight: var(--pl-weight-strong);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pl-cover-profile__detail {
      color: var(--pl-color-cover-muted);
      font: var(--pl-font-caption);
    }
    .pl-cover-profile__chevron {
      color: var(--pl-color-cover-muted);
    }
  `,
})
export class CoverProfile {
  readonly person = input.required<AvatarPerson>()
  /** The type of account, such as « Compte enseignant ». */
  readonly detail = input<string>()

  private readonly cover = inject(Cover, { optional: true })
  /** In a panel, the profile opens a sheet rather than a menu above it. */
  protected readonly chevron = computed<IconName>(() =>
    this.cover?.layout() === 'panel' ? 'chevron_right' : 'expand_more'
  )
}

/** The quiet mention at the very bottom of the cover, such as « Logiciel libre, par cisstech ». */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plCoverCredit]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-cover-credit' },
  template: `<pl-icon name="code" [size]="1" /><span><ng-content /></span>`,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--pl-space-2);
      margin-block-start: var(--pl-space-2);
      padding: var(--pl-space-1) var(--pl-space-2);
      border-radius: var(--pl-radius-control);
      color: var(--pl-color-cover-muted);
      font: var(--pl-font-caption);
      font-weight: var(--pl-weight-regular);
      text-decoration: none;
    }
    :host(:hover) {
      color: var(--pl-color-cover-text);
    }
    :host(:focus-visible) {
      outline-color: var(--pl-color-cover-primary);
    }
  `,
})
export class CoverCredit {}
