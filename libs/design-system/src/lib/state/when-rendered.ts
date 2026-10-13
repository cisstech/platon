import { afterNextRender, DestroyRef, inject, Injector, NgZone } from '@angular/core'

/**
 * What runs a task once the view has rendered, such as moving the focus to what just appeared. The
 * task runs back in the zone: `afterNextRender` runs outside it, where a signal written does not
 * refresh the page. Once the view is gone, nothing runs. Call it in an injection context.
 */
export const whenRendered = (): ((task: () => void) => void) => {
  const injector = inject(Injector)
  const zone = inject(NgZone)
  let gone = false
  inject(DestroyRef).onDestroy(() => (gone = true))

  return (task) => {
    if (gone) return
    afterNextRender(() => zone.run(task), { injector })
  }
}
