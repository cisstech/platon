import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import {
  PreloadAllModules,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withPreloading,
  withComponentInputBinding,
} from '@angular/router'
import { ResourceLoaderConfigProvider } from '@cisstech/nge/services'
import { CoreBrowserModule } from '@platon/core/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(CoreBrowserModule, FeatureWebComponentModule),
    ResourceLoaderConfigProvider({
      useDocumentBaseURI: true,
    }),
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
  ],
}
