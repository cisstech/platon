import { ApplicationConfig } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { sharedProviders } from '../shared/shared.providers'
import { UiBootContext } from '../shared/ui-boot-context'
import { nextRoutes } from './next.routes'

/** Config of the new interface. No Material, no ng-zorro, nothing from the current interface. */
export const nextConfig = (context: UiBootContext): ApplicationConfig => ({
  providers: [...sharedProviders(context), provideRouter(nextRoutes, withComponentInputBinding())],
})
