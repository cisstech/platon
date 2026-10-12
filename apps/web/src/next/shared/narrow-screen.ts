import { BreakpointObserver } from '@angular/cdk/layout'
import { inject, Signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'

/** Below this width, the frame and the pages take their phone layout. */
export const NARROW_SCREEN = '(max-width: 839.98px)'

/** Whether the screen is narrow, kept up to date. Call it in an injection context. */
export const narrowScreen = (): Signal<boolean> => {
  const breakpoints = inject(BreakpointObserver)
  return toSignal(breakpoints.observe(NARROW_SCREEN).pipe(map((state) => state.matches)), {
    initialValue: breakpoints.isMatched(NARROW_SCREEN),
  })
}
