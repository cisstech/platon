import { DOCUMENT } from '@angular/common'
import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { withUiParam } from '../../../ui-switch/ui-url'
import { PageNavigation } from '../../../shared/page-navigation'

/**
 * Opens a screen the new interface does not have yet in the current one, at the same address and for
 * this load only; the preference for the new interface stays.
 */
export const legacyBridgeGuard: CanActivateFn = (_route, state) => {
  const href = withUiParam(new URL(state.url, inject(DOCUMENT).location.origin), 'legacy-once')
  const navigation = inject(PageNavigation)

  // On the first load nothing of the new interface was shown: replace the entry, so Back does not
  // return to an address that would bridge again.
  if (inject(Router).navigated) {
    navigation.assign(href)
  } else {
    navigation.replace(href)
  }
  return false
}
