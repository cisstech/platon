import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router'
import { CoreBrowserModule, TAG_PROVIDERS } from '@platon/core/browser'
import { CAS_PROVIDERS } from '@platon/feature/cas/browser'
import { COURSE_PROVIDERS } from '@platon/feature/course/browser'
import { LTI_PROVIDERS } from '@platon/feature/lti/browser'
import { PLAYER_PROVIDERS } from '@platon/feature/player/browser'
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser'
import { RESULT_PROVIDERS } from '@platon/feature/result/browser'
import { PEER_PROVIDERS } from '@platon/feature/peer/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'
import { DISCORD_PROVIDERS } from '@platon/feature/discord/browser'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(CoreBrowserModule, FeatureWebComponentModule),
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    COURSE_PROVIDERS,
    RESOURCE_PROVIDERS,
    PLAYER_PROVIDERS,
    RESULT_PROVIDERS,
    PEER_PROVIDERS,
    LTI_PROVIDERS,
    CAS_PROVIDERS,
    TAG_PROVIDERS,
    DISCORD_PROVIDERS,
  ],
}
