import { provideAppInitializer, ApplicationConfig, importProvidersFrom, inject } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router'
import { CoreBrowserModule, CoreService, TAG_PROVIDERS } from '@platon/core/browser'
import { CAS_PROVIDERS } from '@platon/feature/cas/browser'
import { COURSE_PROVIDERS } from '@platon/feature/course/browser'
import { LTI_PROVIDERS } from '@platon/feature/lti/browser'
import { PLAYER_PROVIDERS } from '@platon/feature/player/browser'
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser'
import { RESULT_PROVIDERS } from '@platon/feature/result/browser'
import { PEER_PROVIDERS } from '@platon/feature/peer/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'
import { DISCORD_PROVIDERS } from '@platon/feature/discord/browser'
import { ANNOUNCEMENT_PROVIDERS } from '@platon/feature/announcement/browser'
import { TUTO_PROVIDERS } from '@platon/feature/tuto/browser'
import { BUILDER_PROVIDERS } from '@platon/feature/builder/browser'
import { appRoutes } from './app.routes'
import { TESTS_PROVIDERS } from '@platon/feature/tests/browser'
import { sharedProviders } from '../shared.config'

export const appConfig: ApplicationConfig = {
  providers: [
    ...sharedProviders,
    provideAnimations(),
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
    TESTS_PROVIDERS,
    ANNOUNCEMENT_PROVIDERS,
    TUTO_PROVIDERS,
    BUILDER_PROVIDERS,
    provideAppInitializer(() => {
      const core = inject(CoreService)
      return core.init()
    }),
  ],
}
