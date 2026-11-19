import { LiveAnnouncer } from '@angular/cdk/a11y'
import { effect, inject, Signal, untracked } from '@angular/core'

/**
 * Tells screen readers what a search found, once the server has answered it; the first list is not
 * announced. `answered` is the search the list answers, `undefined` while it loads; `said` is what
 * to tell of it. Call it in an injection context.
 */
export const announceSearches = (answered: Signal<string | undefined>, said: () => string): void => {
  const announcer = inject(LiveAnnouncer)
  let last: string | undefined

  effect(() => {
    const search = answered()
    if (search === undefined) return
    if (last !== undefined && search !== last) {
      announcer.announce(untracked(said), 'polite').catch(console.error)
    }
    last = search
  })
}
