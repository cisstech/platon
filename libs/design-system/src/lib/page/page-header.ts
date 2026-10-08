import { ChangeDetectionStrategy, Component, InjectionToken, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/** A step of the breadcrumb. The last one is the current page and takes no link. */
export interface PageCrumb {
  readonly label: string
  readonly link?: string | readonly unknown[]
}

/** Accessible name of the breadcrumb. */
export const BREADCRUMB_LABEL = new InjectionToken<string>('BREADCRUMB_LABEL', {
  factory: () => 'Breadcrumb',
})

/**
 * The head of a page, in this order: the breadcrumb from the second level, the title with the main
 * action on its right (`plPageActions`, secondary actions first), a line of description, the key
 * figures (`pl-page-figure`) and the tabs (`pl-page-tabs`), set on its bottom edge. A course mark or
 * any figure on the left goes in `plPageMark`; an action that belongs to the title, right after it,
 * in `plPageTitleAction`.
 */
@Component({
  selector: 'pl-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink],
  host: { class: 'pl-page-header' },
  template: `
    <div class="pl-page-header__head">
      <ng-content select="[plPageMark]" />
      <div class="pl-page-header__main">
        @if (trail().length) {
        <nav class="pl-page-header__crumbs" [attr.aria-label]="breadcrumbLabel">
          <ol class="pl-page-header__trail">
            @for (crumb of trail(); track $index) {
            <li class="pl-page-header__crumb">
              @if ($last || !crumb.link) {
              <span [attr.aria-current]="$last ? 'page' : null">{{ crumb.label }}</span>
              } @else {
              <a class="pl-page-header__link" [routerLink]="crumb.link">{{ crumb.label }}</a>
              } @if (!$last) {
              <pl-icon class="pl-page-header__chevron" name="chevron_right" [size]="1" />
              }
            </li>
            }
          </ol>
        </nav>
        }
        <div class="pl-page-header__title-row">
          <h1 class="pl-page-header__title">{{ heading() }}</h1>
          <ng-content select="[plPageTitleAction]" />
          <div class="pl-page-header__actions"><ng-content select="[plPageActions]" /></div>
        </div>
        @if (description()) {
        <p class="pl-page-header__description">{{ description() }}</p>
        }
        <div class="pl-page-header__figures"><ng-content select="pl-page-figure" /></div>
      </div>
    </div>
    <ng-content select="pl-page-tabs" />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--pl-space-6);
      margin-block-end: var(--pl-space-6);
    }
    .pl-page-header__head {
      display: flex;
      align-items: flex-start;
      gap: var(--pl-space-4);
    }
    .pl-page-header__main {
      display: grid;
      flex: 1;
      gap: var(--pl-space-1);
      min-inline-size: 0;
    }
    .pl-page-header__trail {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
    }
    .pl-page-header__crumb {
      display: inline-flex;
      align-items: center;
      gap: var(--pl-space-1);
      margin-inline-end: var(--pl-space-1);
    }
    .pl-page-header__link {
      color: inherit;
      text-decoration: none;
    }
    .pl-page-header__link:hover {
      color: var(--pl-color-text);
      text-decoration: underline;
    }
    .pl-page-header__chevron {
      color: var(--pl-color-subtle);
    }
    .pl-page-header__title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--pl-space-2);
    }
    .pl-page-header__title {
      min-inline-size: 0;
      font: var(--pl-font-title);
      letter-spacing: var(--pl-tracking-title);
      overflow-wrap: anywhere;
    }
    .pl-page-header__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--pl-space-2);
      margin-inline-start: auto;
      padding-inline-start: var(--pl-space-2);
    }
    .pl-page-header__description {
      max-inline-size: 72ch;
      color: var(--pl-color-muted);
    }
    .pl-page-header__figures {
      display: flex;
      flex-wrap: wrap;
      gap: var(--pl-space-1) var(--pl-space-4);
      margin-block-start: var(--pl-space-1);
    }
    .pl-page-header__actions:empty,
    .pl-page-header__figures:empty {
      display: none;
    }
  `,
})
export class PageHeader {
  /** The `h1` of the page. */
  readonly heading = input.required<string>()
  readonly description = input<string>()
  /** From the top level to the current page. Shown from the second level only. */
  readonly crumbs = input<readonly PageCrumb[]>([])

  protected readonly breadcrumbLabel = inject(BREADCRUMB_LABEL)
  protected readonly trail = computed(() => (this.crumbs().length > 1 ? this.crumbs() : []))
}

/** A key figure of a page, in small: an icon, a value in bold, a label. */
@Component({
  selector: 'pl-page-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-page-figure' },
  template: `
    @if (icon(); as icon) {
    <pl-icon [name]="icon" [size]="1" />
    } @if (value() !== undefined) {
    <strong class="pl-page-figure__value">{{ value() }}</strong
    >{{ ' ' }}
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--pl-space-1);
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
    }
    .pl-page-figure__value {
      color: var(--pl-color-text);
      font-weight: var(--pl-weight-strong);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class PageFigure {
  readonly icon = input<IconName>()
  readonly value = input<string | number>()
}
