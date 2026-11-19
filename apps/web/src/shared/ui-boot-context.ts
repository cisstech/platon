import { InjectionToken } from '@angular/core'
import { UiFlag, UiMode } from '../ui-switch/ui-mode'

/** How `main.ts` started the interface. */
export interface UiBootContext {
  flag: UiFlag
  stored: UiMode | null
  /** Opened by the new interface for a screen it does not have yet. */
  bridged: boolean
}

export const UI_BOOT_CONTEXT = new InjectionToken<UiBootContext>('UI_BOOT_CONTEXT', {
  factory: () => ({ flag: 'off', stored: null, bridged: false }),
})
