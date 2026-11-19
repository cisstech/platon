import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router } from '@angular/router'
import { filter, map } from 'rxjs'
import { UI_BOOT_CONTEXT } from '../../shared/ui-boot-context'
import { dismissUiOffer, isUiOfferDismissed } from '../../ui-switch/ui-storage'
import { UiSwitchNoticeKind, uiSwitchNoticeView } from './ui-switch-notice.vm'

/** What the current interface says about the new one: the bridge message, or the offer to try it. */
@Component({
  selector: 'app-ui-switch-notice',
  templateUrl: './ui-switch-notice.html',
  styleUrl: './ui-switch-notice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSwitchNotice {
  private readonly router = inject(Router)
  private readonly context = inject(UI_BOOT_CONTEXT)
  private readonly origin = inject(DOCUMENT).location.origin

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => new URL(event.urlAfterRedirects, this.origin))
    ),
    { initialValue: new URL(this.router.url, this.origin) }
  )
  private readonly offerDismissed = signal(isUiOfferDismissed())
  private readonly hidden = signal(false)

  protected readonly notice = computed(() =>
    this.hidden()
      ? null
      : uiSwitchNoticeView({ url: this.url(), context: this.context, offerDismissed: this.offerDismissed() })
  )

  /** « Non merci » is remembered; hiding the bridge message lasts until the next load. */
  protected dismiss(kind: UiSwitchNoticeKind): void {
    if (kind === 'offer') {
      dismissUiOffer()
      this.offerDismissed.set(true)
    } else {
      this.hidden.set(true)
    }
  }
}
