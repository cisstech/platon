import { Injectable, OnDestroy, inject } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs'
import { StorageService } from './storage.service'

export declare type Theme = 'light' | 'dark'

export const alwaysLightTheme = {
  lightTheme: true,
}

const VENDORS_THEMES = ['ng-zorro', 'material']

/**
 * Controls the colors of the application.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly router = inject(Router)
  private readonly storage = inject(StorageService)
  private readonly subscriptions: Subscription[] = []

  private ready?: boolean
  private theme?: Theme
  private savedTheme?: Theme
  private alwaysLightTheme?: boolean

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

  constructor() {
    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.setLightThemeIfAlways()
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  /**
   * Loads the last saved theme from the local storage if not loaded.
   */
  async loadTheme(): Promise<void> {
    if (this.ready) {
      return
    }

    this.savedTheme = (await firstValueFrom(this.storage.get<Theme>('app.theme'))) || 'light'
    await this.setTheme(this.savedTheme)

    this.ready = true
  }

  /**
   * Changes app theme to a dark theme.
   * @param save persists the change on the disk if set to `true`.
   */
  darkTheme(save = true): void {
    this.setTheme('dark', save)
  }

  /**
   * Changes app theme to a light theme.
   * @param save persists the change on the disk if set to `true`.
   */
  lightTheme(save = true): void {
    this.setTheme('light', save)
  }

  /**
   * Alternates the current theme (`light` to `dark` or `dark` to `light`).
   */
  switchTheme(): void {
    const theme = this.theme
    this.setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  private async setTheme(theme: Theme, save = true) {
    if (this.theme === theme || (this.alwaysLightTheme && theme === 'dark')) {
      return
    }
    this.theme = theme

    const container = document.body

    if (!container.classList.contains('mat-app-background')) {
      container.classList.add('mat-app-background')
    }

    if (!container.classList.contains('mat-typography')) {
      container.classList.add('mat-typography')
    }

    container.classList.remove('mat-app-background')
    container.classList.remove('mat-typography')

    container.classList.add('mat-app-background')
    container.classList.add('mat-typography')

    container.classList.remove('dark-theme')
    container.classList.remove('light-theme')

    container.classList.add(theme + '-theme')

    if (save) {
      await firstValueFrom(this.storage.set('app.theme', theme))
      this.savedTheme = theme
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

  private setLightThemeIfAlways(): void {
    this.alwaysLightTheme = false
    let currentRoute = this.router.routerState.root
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild
      const { data } = currentRoute.snapshot
      if (data && !Array.isArray(data) && data.lightTheme) {
        this.alwaysLightTheme = true
        break
      }
    }
    this.setTheme(this.alwaysLightTheme ? 'light' : this.savedTheme || 'light', false)
  }
}
