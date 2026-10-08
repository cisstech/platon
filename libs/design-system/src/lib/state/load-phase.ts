import { DestroyRef, Signal, effect, inject, signal } from '@angular/core'

/** The state of a store that loads data (D8). */
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * What a screen shows while it loads: nothing during the first 300 ms, then a skeleton; at 10 s, a
 * neutral message is added; at 30 s, the loading becomes an error.
 */
export type LoadPhase = 'idle' | 'quiet' | 'skeleton' | 'slow' | 'timeout' | 'ready' | 'error'

export const LOAD_DELAYS = { skeleton: 300, slow: 10_000, timeout: 30_000 } as const

export const loadPhase = (status: LoadStatus, elapsed: number): LoadPhase => {
  if (status !== 'loading') return status
  if (elapsed < LOAD_DELAYS.skeleton) return 'quiet'
  if (elapsed < LOAD_DELAYS.slow) return 'skeleton'
  if (elapsed < LOAD_DELAYS.timeout) return 'slow'
  return 'timeout'
}

/**
 * Follows a store status through time: the phase moves on at each delay while it keeps loading.
 * A store that starts again while still loading, as « Réessayer » after the timeout does, changes
 * `attempt` to restart the clock. Call it in an injection context.
 */
export const trackLoadPhase = (status: Signal<LoadStatus>, attempt?: Signal<unknown>): Signal<LoadPhase> => {
  const phase = signal<LoadPhase>(loadPhase(status(), 0))
  const timers: ReturnType<typeof setTimeout>[] = []
  const clear = () => timers.splice(0).forEach((timer) => clearTimeout(timer))

  effect(() => {
    const current = status()
    attempt?.()
    clear()
    phase.set(loadPhase(current, 0))
    if (current !== 'loading') return
    for (const delay of Object.values(LOAD_DELAYS)) {
      timers.push(setTimeout(() => phase.set(loadPhase('loading', delay)), delay))
    }
  })
  inject(DestroyRef).onDestroy(clear)
  return phase.asReadonly()
}

/** The page is busy until its data is there or has failed. */
export const isBusy = (phase: LoadPhase) => phase === 'quiet' || phase === 'skeleton' || phase === 'slow'

/** The skeleton stays while the message of a slow loading is shown. */
export const showsSkeleton = (phase: LoadPhase) => phase === 'skeleton' || phase === 'slow'

/** A loading that failed, or that took too long, is shown as an error, never as an empty place. */
export const hasFailed = (phase: LoadPhase) => phase === 'error' || phase === 'timeout'
