import { Injectable, OnDestroy, inject } from '@angular/core'
import { Data, NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs'
import { StorageService } from './storage.service'

export declare type Theme = 'light' | 'dark' | 'system'

/**
 * Prevents the theme service from loading theme styles into the DOM
 * if passed in the current route or any of its parents data.
 */
export const noTheme = {
  noTheme: true,
} as const

/**
 * Forces the theme service to load the light theme into the DOM
 * if passed in the current route or any of its parents data.
 */
export const alwaysLightTheme = {
  lightTheme: true,
} as const

const VENDORS_THEMES = ['ng-zorro', 'material']

/**
 * Controls the colors of the application.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly router = inject(Router)
  private readonly storage = inject(StorageService)
  private readonly subscriptions: Subscription[] = []

  private theme?: Theme
  private savedTheme?: Theme
  private noTheme?: boolean
  private alwaysLightTheme?: boolean
  private isSystemTheme?: boolean

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

  get themeIcon() {
    if (this.isSystemTheme) return 'auto_awesome'
    return this.isDark ? 'dark_mode' : 'light_mode'
  }

  constructor() {
    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.checkNoThemeInRouteData()
          this.checkAlwaysLightThemeInRouteData()
        }
      })
    )
    this.refreshSystemTheme()
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
    darkModePreference.addEventListener('change', () => {
      this.refreshSystemTheme()
    })
  }

  private refreshSystemTheme(): void {
    if (this.isSystemTheme) {
      this.setTheme('system', true).catch(console.error)
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  /**
   * Loads the last saved theme from the local storage if not loaded.
   */
  async loadTheme(): Promise<void> {
    if (this.theme) return

    this.savedTheme = (await firstValueFrom(this.storage.get<Theme>('app.theme'))) || 'light'
    await this.setTheme(this.savedTheme)
  }

  /**
   * Changes app theme to a dark theme.
   * @param save persists the change on the disk if set to `true`.
   */
  darkTheme(save = true): void {
    this.setTheme('dark', save).catch(console.error)
  }

  /**
   * Changes app theme to a light theme.
   * @param save persists the change on the disk if set to `true`.
   */
  lightTheme(save = true): void {
    this.setTheme('light', save).catch(console.error)
  }

  systemTheme(save = true): void {
    this.setTheme('system', save).catch(console.error)
  }

  /**
   * Alternates the current theme (`light` to `dark` or `dark` to `light`).
   */
  switchTheme(): void {
    const theme = this.theme
    this.setTheme(theme === 'dark' ? 'light' : 'dark').catch(console.error)
  }

  private async setTheme(theme: Theme, save = true) {
    this.isSystemTheme = theme === 'system'

    if (this.noTheme) return
    if (this.theme === theme) return
    if (this.alwaysLightTheme && theme === 'dark') return

    if (this.isSystemTheme) {
      theme = this.detectSystemTheme()
    }

    this.theme = theme

    this.removeTheme()

    const container = document.body
    container.classList.add('mat-app-background')
    container.classList.add('mat-typography')
    container.classList.add(theme + '-theme')

    if (save) {
      await firstValueFrom(this.storage.set('app.theme', this.isSystemTheme ? 'system' : theme))
      this.savedTheme = theme
    }

    VENDORS_THEMES.forEach((vendor) => {
      const link = document.createElement('link')
      link.href = `styles.${vendor}.${theme}.css`
      link.rel = 'stylesheet'
      link.setAttribute(vendor, 'true')
      document.head.appendChild(link)
    })

    this.theme$.next(theme)
  }

  private removeTheme(): void {
    const container = document.body
    container.classList.remove('mat-app-background')
    container.classList.remove('mat-typography')
    container.classList.remove('dark-theme')
    container.classList.remove('light-theme')
    VENDORS_THEMES.forEach((vendor) => {
      const old = document.head.querySelector(`link[${vendor}="true"]`)
      if (old) {
        old.remove()
      }
    })
  }

  private checkRouteData(consumer: (data: Data) => boolean): boolean {
    let currentRoute = this.router.routerState.root
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild
      const { data } = currentRoute.snapshot
      if (data && !Array.isArray(data) && consumer(data)) {
        return true
      }
    }
    return false
  }

  private checkNoThemeInRouteData(): void {
    const wasNoTheme = this.noTheme
    this.noTheme = false
    this.checkRouteData((data) => {
      if (data.noTheme) {
        this.noTheme = true
        return true
      }
      return false
    })

    if (wasNoTheme && !this.noTheme) {
      this.setTheme(this.savedTheme || 'light', false).catch(console.error)
    }
  }

  private checkAlwaysLightThemeInRouteData(): void {
    this.alwaysLightTheme = false
    this.checkRouteData((data) => {
      if (data.lightTheme) {
        this.alwaysLightTheme = true
        return true
      }
      return false
    })
    this.setTheme(this.alwaysLightTheme ? 'light' : this.savedTheme || 'light', false).catch(console.error)
  }

  private detectSystemTheme(): Theme {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDarkMode ? 'dark' : 'light'
  }
}
