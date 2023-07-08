import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { StorageService } from './storage.service'

export declare type Theme = 'light' | 'dark'

const VENDORS_THEMES = ['ng-zorro', 'material']

/**
 * Controls the colors of the application.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private loaded?: boolean
  private theme?: Theme
  private theme$ = new BehaviorSubject<Theme>('light')

  /** Gets a value indicating whether the current theme is dark. */
  get isDark(): boolean {
    return this.theme === 'dark'
  }

  /** Gets a value indicating whether the current theme is light. */
  get isLight(): boolean {
    return this.theme === 'light'
  }

  get themeChange(): Observable<Theme> {
    return this.theme$.asObservable()
  }

  constructor(private readonly storage: StorageService) {}

  /**
   * Loads the last saved theme from the local storage if not loaded.
   */
  async loadTheme(): Promise<void> {
    if (this.loaded) {
      return
    }

    this.theme = (await this.storage.get<Theme>('app.theme').toPromise()) || 'light'

    await this.setTheme(this.theme)

    this.loaded = true
  }

  /**
   * Changes app theme to a dark theme.
   * @param save persists the change on the disk if set to `true`.
   */
  darkTheme(save: boolean = true): void {
    this.setTheme('dark', save)
  }

  /**
   * Changes app theme to a light theme.
   * @param save persists the change on the disk if set to `true`.
   */
  lightTheme(save: boolean = true): void {
    this.setTheme('light', save)
  }

  /**
   * Alternates the current theme (`light` to `dark` or `dark` to `light`).
   */
  switchTheme(): void {
    const theme = this.theme
    this.setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  private async setTheme(theme: Theme, save: boolean = true) {
    this.theme = theme

    const html = document.documentElement

    if (!html.classList.contains('mat-app-background')) {
      html.classList.add('mat-app-background')
    }

    if (!html.classList.contains('mat-typography')) {
      html.classList.add('mat-typography')
    }

    html.classList.remove('mat-app-background')
    html.classList.remove('mat-typography')

    html.classList.add('mat-app-background')
    html.classList.add('mat-typography')

    html.classList.remove('dark-theme')
    html.classList.remove('light-theme')

    html.classList.add(theme + '-theme')

    if (save) {
      await this.storage.set('app.theme', theme).toPromise()
    }

    const head = document.head

    VENDORS_THEMES.forEach((vendor) => {
      const old = head.querySelector(`link[${vendor}="true"]`)
      if (old) {
        old.remove()
      }

      const link = document.createElement('link')
      link.href = `styles.${vendor}.${theme}.css`
      link.rel = 'stylesheet'
      link.setAttribute(vendor, 'true')
      document.head.appendChild(link)
    })

    this.theme$.next(theme)
  }
}
