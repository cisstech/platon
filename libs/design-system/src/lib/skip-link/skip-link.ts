import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { PAGE_CONTENT_ID } from '../page/page'

/**
 * The first stop of the keyboard: hidden until focused, it moves the focus to the main landmark.
 * The focus moves by script, since a fragment link resolves against the base URL of the
 * application and would reload the page.
 */
@Component({
  // A component on a native link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plSkipLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-skip-link',
    '[attr.href]': "'#' + target()",
    '(click)': 'skip($event)',
  },
  templateUrl: './skip-link.html',
  styleUrl: './skip-link.scss',
})
export class SkipLink {
  /** Id of the element that receives the focus. */
  readonly target = input(PAGE_CONTENT_ID)

  private readonly document = inject(DOCUMENT)

  protected skip(event: Event): void {
    event.preventDefault()
    this.document.getElementById(this.target())?.focus()
  }
}
