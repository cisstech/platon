import { DOCUMENT } from '@angular/common'
import { Injectable, inject } from '@angular/core'

/** `location.assign` and `location.replace` behind a service, since `location` cannot be replaced in tests. */
@Injectable({ providedIn: 'root' })
export class PageNavigation {
  private readonly location = inject(DOCUMENT).location

  assign(href: string): void {
    this.location.assign(href)
  }

  replace(href: string): void {
    this.location.replace(href)
  }
}
