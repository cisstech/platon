import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'
import { EnvironmentProviders, Provider, provideZoneChangeDetection } from '@angular/core'

/** Providers both interfaces start with. Everything specific to one interface stays in its own config. */
export const sharedProviders: (Provider | EnvironmentProviders)[] = [
  provideZoneChangeDetection(),
  provideHttpClient(withXhr(), withInterceptorsFromDi()),
]
