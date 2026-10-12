import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** The navigation of the cover, a landmark named by `label`. */
@Component({
  selector: 'pl-cover-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-cover-nav',
    role: 'navigation',
    '[attr.aria-label]': 'label()',
  },
  templateUrl: './cover-nav.html',
  styleUrl: './cover-nav.scss',
})
export class CoverNav {
  readonly label = input.required<string>()
}
