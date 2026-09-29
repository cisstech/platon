import { ApplicationRef } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { UiBootContext } from '../shared/ui-boot-context'
import { appConfig } from './app.config'
import { AppPage } from './app.page'
import { mountUiSwitchNotice } from './ui-switch/mount-ui-switch-notice'

export const bootstrap = async (context: UiBootContext): Promise<ApplicationRef> => {
  const appRef = await bootstrapApplication(AppPage, appConfig(context))
  mountUiSwitchNotice(appRef)
  return appRef
}
