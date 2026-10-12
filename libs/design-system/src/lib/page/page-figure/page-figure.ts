import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../../icon/icon'
import { IconName } from '../../icon/icon-names'

/** A key figure of a page, in small: an icon, a value in bold, a label. */
@Component({
  selector: 'pl-page-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-page-figure' },
  templateUrl: './page-figure.html',
  styleUrl: './page-figure.scss',
})
export class PageFigure {
  readonly icon = input<IconName>()
  readonly value = input<string | number>()
}
