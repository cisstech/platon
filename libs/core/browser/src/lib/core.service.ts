import { Injectable, OnDestroy, inject } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { NzIconService } from 'ng-zorro-antd/icon'
import { Subscription } from 'rxjs'
import { ThemeService } from './services/theme.service'

@Injectable({ providedIn: 'root' })
export class CoreService implements OnDestroy {
  private readonly themeService = inject(ThemeService)
  private readonly iconRegistry = inject(MatIconRegistry)
  private readonly nzIconService = inject(NzIconService)
  private readonly subscriptions: Subscription[] = []

  init() {
    this.themeService.loadTheme()
    this.nzIconService.changeAssetsSource('assets/vendors/@ant-design')
    this.iconRegistry.setDefaultFontSetClass('material-icons-outlined')
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }
}
