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
  template: '<ng-content />',
  styles: `
    :host {
      position: fixed;
      inset-block-start: var(--pl-space-2);
      inset-inline-start: var(--pl-space-2);
      z-index: var(--pl-layer-tooltip);
      padding: var(--pl-space-2) var(--pl-space-3);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-surface);
      color: var(--pl-color-primary);
      font: var(--pl-font-body);
      font-weight: var(--pl-weight-strong);
      text-decoration: none;
      transform: translateY(calc(-100% - var(--pl-space-4)));
    }
    :host(:focus) {
      box-shadow: var(--pl-shadow-overlay);
      transform: none;
    }
  `,
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
