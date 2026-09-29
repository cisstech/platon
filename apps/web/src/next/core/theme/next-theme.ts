import { DOCUMENT } from '@angular/common'
import { Injectable, inject, signal } from '@angular/core'
import { StorageService } from '@platon/core/browser/shared'
import { firstValueFrom } from 'rxjs'

export type ThemePreference = 'light' | 'dark' | 'system'

/** Same key and values as the current interface, so the choice follows the person between both. */
const STORAGE_KEY = 'app.theme'

const parsePreference = (value: unknown): ThemePreference => (value === 'dark' || value === 'system' ? value : 'light')

/**
 * Theme of the new interface: `data-theme` on the root, which the tokens read. `system` removes it,
 * and the tokens follow the system preference; they do the same until the saved choice is read.
 */
@Injectable({ providedIn: 'root' })
export class NextTheme {
  private readonly storage = inject(StorageService)
  private readonly root = inject(DOCUMENT).documentElement

  readonly preference = signal<ThemePreference>('light')

  /** Applies the saved choice; light when there is none, as in the current interface. */
  async restore(): Promise<void> {
    this.apply(parsePreference(await firstValueFrom(this.storage.getString(STORAGE_KEY))))
  }

  async choose(preference: ThemePreference): Promise<void> {
    this.apply(preference)
    await firstValueFrom(this.storage.set(STORAGE_KEY, preference))
  }

  private apply(preference: ThemePreference): void {
    this.preference.set(preference)
    if (preference === 'system') delete this.root.dataset['theme']
    else this.root.dataset['theme'] = preference
  }
}
