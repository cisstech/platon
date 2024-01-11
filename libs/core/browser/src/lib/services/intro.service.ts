import { Injectable } from '@angular/core'
import { ResourceLoaderService } from '@cisstech/nge/services'
import introJs from 'intro.js'
import { firstValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class IntroService {
  constructor(private readonly resourceLoader: ResourceLoaderService) {}

  async create(options?: {
    element?: HTMLElement
    querySelector?: string
    onWillShow: Record<number, () => void | Promise<void>>
  }) {
    await firstValueFrom(this.resourceLoader.loadAllSync([['style', 'assets/vendors/intro.js/introjs.css']]))
    if (options?.element) {
      return introJs(options.element)
    }
    if (options?.querySelector) {
      return introJs(options.querySelector)
    }
    const intro = introJs()
    let step = 0
    intro.onbeforechange(async () => {
      await options?.onWillShow?.[step]?.()
      step++
    })
    return intro
  }
}
