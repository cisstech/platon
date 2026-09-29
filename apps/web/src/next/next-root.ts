import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NextTheme } from './core/theme/next-theme'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextRoot {
  constructor() {
    // Not awaited: the tokens follow the system preference until the saved theme is read.
    inject(NextTheme).restore().catch(console.error)
  }
}
