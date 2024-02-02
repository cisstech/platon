import { Injectable, inject } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { NzIconService } from 'ng-zorro-antd/icon'
import { ThemeService } from './services/theme.service'

@Injectable({ providedIn: 'root' })
export class CoreService {
  private readonly themeService = inject(ThemeService)
  private readonly iconRegistry = inject(MatIconRegistry)
  private readonly nzIconService = inject(NzIconService)

  init() {
    this.themeService.loadTheme().catch(console.error)
    this.nzIconService.changeAssetsSource('assets/vendors/@ant-design')
    this.iconRegistry.setDefaultFontSetClass('material-icons-outlined')
  }
}
