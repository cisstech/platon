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
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  /** The title of the page, as the browser tab shows it. */
  readonly heading = input.required<string>()
}
