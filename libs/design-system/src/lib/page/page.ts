import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core'

/** Id of the main landmark, the target of the skip link. */
export const PAGE_CONTENT_ID = 'contenu'

/** `list`: 1200 px, for lists and dashboards. `form`: 760 px. `full`: the whole width, for a workshop. */
export type PageWidth = 'list' | 'form' | 'full'

/**
 * The main landmark of a screen, target of the skip link, with the margins and the width of its
 * content. Busy while its data loads.
 */
@Component({
  selector: 'pl-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-width]': 'width()' },
  templateUrl: './page.html',
  styleUrl: './page.scss',
})
export class Page {
  readonly width = input<PageWidth>('list')
  readonly busy = input(false, { transform: booleanAttribute })
  protected readonly contentId = PAGE_CONTENT_ID
}
