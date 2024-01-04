import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { provideAnimations } from '@angular/platform-browser/animations'
import { PreloadAllModules, provideRouter, withEnabledBlockingInitialNavigation, withPreloading } from '@angular/router'
import { ResourceLoaderConfig } from '@cisstech/nge/services'
import { CoreBrowserModule } from '@platon/core/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'
import { appRoutes } from './app.routes'

export const resourceLoaderConfig: ResourceLoaderConfig = {
  useDocumentBaseURI: true,
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      CoreBrowserModule,
      FeatureWebComponentModule,

      MatDialogModule,
      MatSnackBarModule
    ),
    { provide: ResourceLoaderConfig, useValue: resourceLoaderConfig },
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withPreloading(PreloadAllModules)),
  ],
}
