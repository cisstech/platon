import { computed, Signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { announceSearches } from '@platon/design-system'
import { debounceTime } from 'rxjs'
import { SEARCH_PAUSE } from '../../shared/search-pause'
import { filterOutcome, GroupView, OverviewFilters } from './course.vm'

/**
 * Tells screen readers what a search or a state of the overview leaves, once the person pauses; the
 * first list is not announced. Call it in an injection context.
 */
export const announceFilters = (filters: Signal<OverviewFilters>, groups: Signal<GroupView<unknown>[]>): void => {
  const asked = computed(() => `${filters().search.trim()}\n${filters().state}`)
  const paused = toSignal(toObservable(asked).pipe(debounceTime(SEARCH_PAUSE)))
  announceSearches(paused, () => filterOutcome(groups()))
}
