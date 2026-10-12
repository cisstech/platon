import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Alert, Button } from '@platon/design-system'
import { BannerView } from '../../home.vm'

/** The banner of a home: one announcement, which says where to read it and closes for good. */
@Component({
  selector: 'app-home-banner',
  imports: [Alert, Button, RouterLink],
  templateUrl: './home-banner.html',
  styleUrl: './home-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBanner {
  readonly banner = input.required<BannerView>()
  readonly dismissed = output<void>()
}
