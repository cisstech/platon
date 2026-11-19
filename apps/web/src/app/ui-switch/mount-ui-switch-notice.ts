import { ApplicationRef, createComponent } from '@angular/core'
import { UiSwitchNotice } from './ui-switch-notice'

/** Mounts the notice next to the app root, so no existing component changes. */
export const mountUiSwitchNotice = (appRef: ApplicationRef): void => {
  const notice = createComponent(UiSwitchNotice, { environmentInjector: appRef.injector })
  document.body.appendChild(notice.location.nativeElement)
  appRef.attachView(notice.hostView)
}
