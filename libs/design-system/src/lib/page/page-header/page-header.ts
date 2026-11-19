import { ChangeDetectionStrategy, Component, InjectionToken, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Icon } from '../../icon/icon'

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
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
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
