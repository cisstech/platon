import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter } from 'rxjs'
import { PageNavigation } from '../../shared/page-navigation'
import { isPorted } from '../../shared/ported-paths'
import { UI_BOOT_CONTEXT } from '../../shared/ui-boot-context'

/**
 * When the new interface opened this one for a screen it does not have yet, a navigation to an
 * address the new interface serves goes back to it: a full load, so that the stored preference picks
 * the new interface again. A navigation that replaces its history entry replaces it here too. The
 * first navigation stays: the new interface sent it here, even at an address it serves (the step of
 * an external application on the sign-in page), and sending it back would bounce forever.
 */
export const provideReturnToNext = (): EnvironmentProviders =>
  provideEnvironmentInitializer(() => {
    if (!inject(UI_BOOT_CONTEXT).bridged) return
    const navigation = inject(PageNavigation)
    const router = inject(Router)
    router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        if (!router.navigated || !isPorted(event.url)) return
        if (router.currentNavigation()?.extras.replaceUrl) navigation.replace(event.url)
        else navigation.assign(event.url)
      })
  })
