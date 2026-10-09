import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { ApplicationConfig, importProvidersFrom } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { AuthProviders, DialogService, GraphQLModule, HttpParamEncoderInterceptor } from '@platon/core/browser/shared'
import { BREADCRUMB_LABEL, TOAST_INSET_START } from '@platon/design-system'
import { CAS_PROVIDERS } from '@platon/feature/cas/browser/shared'
import { RESOURCE_PROVIDERS } from '@platon/feature/resource/browser/shared'
import { RESULT_PROVIDERS } from '@platon/feature/result/browser/shared'
import { sharedProviders } from '../shared/shared.providers'
import { UiBootContext } from '../shared/ui-boot-context'
import { NextDialog } from './core/dialog/next-dialog'
import { nextRoutes } from './next.routes'

/** Config of the new interface. No Material, no ng-zorro, nothing from the current interface. */
export const nextConfig = (context: UiBootContext): ApplicationConfig => ({
  providers: [
    ...sharedProviders(context),
    provideRouter(nextRoutes, withComponentInputBinding()),
    { provide: HTTP_INTERCEPTORS, useClass: HttpParamEncoderInterceptor, multi: true },
    AuthProviders,
    importProvidersFrom(GraphQLModule),
    RESULT_PROVIDERS,
    RESOURCE_PROVIDERS,
    CAS_PROVIDERS,
    { provide: DialogService, useClass: NextDialog },
    { provide: BREADCRUMB_LABEL, useValue: "Fil d'Ariane" },
    // The toasts sit at the bottom left of the page, beside the cover.
    { provide: TOAST_INSET_START, useValue: 'var(--pl-cover-width)' },
  ],
})
