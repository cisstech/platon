import { registerLocaleData } from '@angular/common'
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'
import localeFr from '@angular/common/locales/fr'
import { EnvironmentProviders, LOCALE_ID, Provider, provideZoneChangeDetection } from '@angular/core'
import { UI_BOOT_CONTEXT, UiBootContext } from './ui-boot-context'

registerLocaleData(localeFr)

/** What both interfaces start with. Everything specific to one of them stays in its own config. */
export const sharedProviders = (context: UiBootContext): (Provider | EnvironmentProviders)[] => [
  provideZoneChangeDetection(),
  provideHttpClient(withXhr(), withInterceptorsFromDi()),
  { provide: LOCALE_ID, useValue: 'fr-FR' },
  { provide: UI_BOOT_CONTEXT, useValue: context },
]
