import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * The bar that replaces the cover on a narrow screen, in its colors: an action at the start
 * (`plTopbarStart`, opening the navigation), the title of the page, actions at the end
 * (`plTopbarEnd`). It is the banner of the application there.
 */
@Component({
  selector: 'pl-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-topbar', role: 'banner' },
  template: `
    <ng-content select="[plTopbarStart]" />
    <span class="pl-topbar__title">{{ heading() }}</span>
    <ng-content select="[plTopbarEnd]" />
  `,
  styles: `
    :host {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--pl-layer-sticky);
      display: flex;
      align-items: center;
      gap: var(--pl-space-2);
      block-size: var(--pl-topbar-height);
      padding: 0 var(--pl-space-2);
      background: var(--pl-color-cover);
      color: var(--pl-color-cover-text);
    }
    .pl-topbar__title {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      font: var(--pl-font-subheading);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class Topbar {
  /** The title of the page, as the browser tab shows it. */
  readonly heading = input.required<string>()
}
