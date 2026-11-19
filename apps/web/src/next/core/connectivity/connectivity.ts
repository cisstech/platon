import { DOCUMENT } from '@angular/common'
import { DestroyRef, Injectable, inject, signal } from '@angular/core'

/** Whether the device reaches the network, as the browser knows it. */
@Injectable({ providedIn: 'root' })
export class Connectivity {
  private readonly window = inject(DOCUMENT).defaultView
  private readonly state = signal(this.read())

  readonly online = this.state.asReadonly()

  constructor() {
    const update = () => this.state.set(this.read())
    this.window?.addEventListener('online', update)
    this.window?.addEventListener('offline', update)
    inject(DestroyRef).onDestroy(() => {
      this.window?.removeEventListener('online', update)
      this.window?.removeEventListener('offline', update)
    })
  }

  private read(): boolean {
    return this.window?.navigator.onLine ?? true
  }
}
