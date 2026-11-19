import { DestroyRef, effect, inject, untracked } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { Session } from '../../core/session/session'
import { CourseListFilters, filtersFrom, paramsOf, sameLists } from './courses.vm'
import { CoursesStore } from './data/courses-store'

/**
 * Binds the list to its address, which leads. The store starts from the filters of the address and
 * follows them when the address changes with the page open (« Cours » of the cover, Back). The filters
 * the person chooses go back to the address, without a new entry in the history. Call it in an
 * injection context.
 */
export const bindAddress = (): void => {
  const store = inject(CoursesStore)
  const session = inject(Session)
  const router = inject(Router)
  const route = inject(ActivatedRoute)

  // « Toute la plateforme » is for an administrator: anyone else gets their current courses.
  const allowed = (filters: CourseListFilters): CourseListFilters =>
    filters.tab === 'platform' && !session.isAdmin() ? { ...filters, tab: 'current' } : filters

  store.start(allowed(filtersFrom(route.snapshot.queryParamMap)), session.isTeacher())
  inject(DestroyRef).onDestroy(() => store.stop())

  route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
    const wanted = allowed(filtersFrom(params))
    const filters = store.filters()
    if (!sameLists(wanted, filters) || wanted.tab !== filters.tab) store.choose(wanted)
  })

  /** Writes the filters in the address, without a new entry in the history. */
  const write = (queryParams: Params): void => {
    router
      .navigate([], { relativeTo: route, queryParams, queryParamsHandling: 'merge', replaceUrl: true })
      .catch(console.error)
  }

  effect(() => {
    const queryParams = paramsOf(store.filters())
    untracked(() => write(queryParams))
  })
}
