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
  template: `
    <main class="pl-page__main" tabindex="-1" [id]="contentId" [attr.aria-busy]="busy() ? 'true' : null">
      <ng-content />
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .pl-page__main {
      max-inline-size: calc(1200px + 2 * var(--pl-space-8));
      padding: var(--pl-space-8);
    }
    .pl-page__main:focus {
      outline: none;
    }
    :host([data-width='form']) .pl-page__main {
      max-inline-size: calc(760px + 2 * var(--pl-space-8));
    }
    :host([data-width='full']) .pl-page__main {
      max-inline-size: none;
    }
    @media (max-width: 839.98px) {
      .pl-page__main,
      :host([data-width]) .pl-page__main {
        max-inline-size: none;
        padding: var(--pl-space-4);
      }
    }
  `,
})
export class Page {
  readonly width = input<PageWidth>('list')
  readonly busy = input(false, { transform: booleanAttribute })
  protected readonly contentId = PAGE_CONTENT_ID
}
