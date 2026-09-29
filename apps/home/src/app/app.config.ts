import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withPreloading,
  withComponentInputBinding,
} from '@angular/router'
import { ResourceLoaderConfigProvider } from '@cisstech/nge/services'
import { CoreBrowserModule, CoreService, NgZorroProviders } from '@platon/core/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    importProvidersFrom(CoreBrowserModule, FeatureWebComponentModule),
    NgZorroProviders,
    ResourceLoaderConfigProvider({
      useDocumentBaseURI: true,
    }),
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideAppInitializer(() => {
      const core = inject(CoreService)
      return core.init()
    }),
  ],
}
