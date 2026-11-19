import { ApplicationConfig, importProvidersFrom } from '@angular/core'
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
import { RESOURCE_NOTIFICATION_PROVIDERS, RESOURCE_PROVIDERS } from '@platon/feature/resource/browser'
import { RESULT_PROVIDERS } from '@platon/feature/result/browser'
import { PEER_PROVIDERS } from '@platon/feature/peer/browser'
import { DISCORD_PROVIDERS } from '@platon/feature/discord/browser'
import { ANNOUNCEMENT_PROVIDERS } from '@platon/feature/announcement/browser'
import { BUILDER_PROVIDERS } from '@platon/feature/builder/browser'
import { TESTS_PROVIDERS } from '@platon/feature/tests/browser'
import { sharedProviders } from '../shared/shared.providers'
import { UiBootContext } from '../shared/ui-boot-context'
import { appRoutes } from './app.routes'
import { legacyProviders } from './legacy.providers'
import { provideReturnToNext } from './ui-switch/return-to-next'

/** Config of the current interface. */
export const appConfig = (context: UiBootContext): ApplicationConfig => ({
  providers: [
    ...sharedProviders(context),
    importProvidersFrom(CoreBrowserModule),
    ...legacyProviders,
    provideRouter(
      appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideReturnToNext(),
    COURSE_PROVIDERS,
    RESOURCE_PROVIDERS,
    RESOURCE_NOTIFICATION_PROVIDERS,
    PLAYER_PROVIDERS,
    RESULT_PROVIDERS,
    PEER_PROVIDERS,
    LTI_PROVIDERS,
    CAS_PROVIDERS,
    TAG_PROVIDERS,
    DISCORD_PROVIDERS,
    TESTS_PROVIDERS,
    ANNOUNCEMENT_PROVIDERS,
    BUILDER_PROVIDERS,
  ],
})
