import { ApplicationConfig } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { sharedProviders } from '../shared.config'
import { nextRoutes } from './next.routes'

export const nextConfig: ApplicationConfig = {
  providers: [...sharedProviders, provideRouter(nextRoutes, withComponentInputBinding())],
}
