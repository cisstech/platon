import { EnvironmentProviders, Provider, importProvidersFrom, inject, provideAppInitializer } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { CoreService, DialogService, NgZorroProviders, NzDialogService } from '@platon/core/browser'
import { TUTO_PROVIDERS } from '@platon/feature/tuto/browser'
import { FeatureWebComponentModule } from '@platon/feature/webcomponent'

/**
 * What only the current interface needs: Material and ng-zorro setup, the dialogs on ng-zorro, the
 * exercise web components, the tutorials and the theme initializer. The new interface never loads this file.
 */
export const legacyProviders: (Provider | EnvironmentProviders)[] = [
  provideAnimations(),
  NgZorroProviders,
  { provide: DialogService, useClass: NzDialogService },
  importProvidersFrom(FeatureWebComponentModule),
  TUTO_PROVIDERS,
  provideAppInitializer(() => inject(CoreService).init()),
]
