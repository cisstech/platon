import { computed, inject, Injectable, signal } from '@angular/core'
import { LoadStatus } from '@platon/design-system'
import { Course, PlayableActivity } from '@platon/feature/course/common'
import { defer, firstValueFrom, forkJoin, Observable, of, Subscription } from 'rxjs'
import { patiently } from '../../../shared/patiently'
import { SEARCH_PAUSE } from '../../../shared/search-pause'
import { CourseListFilters, DEFAULT_FILTERS, sameLists } from '../courses.vm'
import { CoursesApi } from './courses-api'

interface Lists {
  readonly current: Course[]
  readonly archived: Course[]
  readonly activities?: PlayableActivity[]
  readonly platform?: { courses: Course[]; total: number }
}

/**
 * The store of the list of courses, provided by its route. It loads the current and the archived
 * courses together, so that each tab says how many it holds; for a student, their activities once,
 * for their progress and their deadlines; for an administrator on « Toute la plateforme », its pages.
 * Archiving moves a course at once, and puts it back if the server refuses.
 */
@Injectable()
export class CoursesStore {
  private readonly api = inject(CoursesApi)
  private loading?: Subscription
  private refreshing?: Subscription
  private searching?: ReturnType<typeof setTimeout>
  /** A teacher or an administrator reads the headcount, not a progress: no activity to load. */
  private teaches = false

  readonly status = signal<LoadStatus>('idle')
  /** Changes on each « Réessayer », so that the loading phase starts its clock again. */
  readonly attempt = signal(0)
  /** A list arrived since the page opened: a search keeps it in view while it loads. */
  readonly loaded = signal(false)
  /** The filters the person asked for, the search as they type it. */
  readonly filters = signal<CourseListFilters>(DEFAULT_FILTERS)
  /** The filters of the lists shown, once the server has answered them. */
  readonly applied = signal<CourseListFilters>(DEFAULT_FILTERS)
  readonly current = signal<Course[]>([])
  readonly archived = signal<Course[]>([])
  /** The activities of a student in every course; none for a teacher. */
  readonly activities = signal<PlayableActivity[] | undefined>(undefined)
  /** The courses a student brought back from their archives, whose activities are on their way. */
  readonly missing = signal<ReadonlySet<string>>(new Set())
  readonly platform = signal<Course[]>([])
  readonly platformTotal = signal(0)
  /** The next page of the platform: none asked, on its way, or failed. */
  readonly more = signal<'idle' | 'loading' | 'error'>('idle')
  readonly hasMore = computed(() => this.platform().length < this.platformTotal())
  /** The courses of the tab chosen. */
  readonly listed = computed(() => {
    const { tab } = this.filters()
    if (tab === 'platform') return this.platform()
    return tab === 'archived' ? this.archived() : this.current()
  })
  /** When the page opened: what the deadlines are measured from. */
  now = new Date()

  /** Loads the lists of the filters. The route keeps its store from one visit to the next: each visit starts afresh. */
  start(filters: CourseListFilters, teaches: boolean): void {
    this.refreshing?.unsubscribe()
    this.teaches = teaches
    this.now = new Date()
    this.filters.set(filters)
    this.applied.set(filters)
    this.loaded.set(false)
    this.current.set([])
    this.archived.set([])
    this.activities.set(undefined)
    this.missing.set(new Set())
    this.platform.set([])
    this.platformTotal.set(0)
    this.more.set('idle')
    this.load()
  }

  /** Stops loading: the page is gone. */
  stop(): void {
    this.loading?.unsubscribe()
    this.refreshing?.unsubscribe()
    clearTimeout(this.searching)
  }

  /** Starts over, even while a load hangs: its late answer is then dropped. */
  retry(): void {
    this.attempt.update((attempt) => attempt + 1)
    this.load()
  }

  /** Searches as the person types, once they pause. */
  search(term: string): void {
    this.filters.update((filters) => ({ ...filters, search: term }))
    clearTimeout(this.searching)
    this.searching = setTimeout(() => this.load(), SEARCH_PAUSE)
  }

  /**
   * Changes the filters at once. The current and archived courses are both loaded already: a new tab
   * loads nothing, but « Toute la plateforme », and a search waiting for its pause goes at once.
   */
  choose(changes: Partial<CourseListFilters>): void {
    const before = this.filters()
    const after = { ...before, ...changes }
    this.filters.set(after)
    const opensPlatform = after.tab === 'platform' && before.tab !== 'platform'
    if (!sameLists(after, this.applied()) || opensPlatform) this.load()
  }

  /** Clears the search and the period at once: what found nothing goes. */
  clearFilters(): void {
    this.choose({ search: '', period: 0 })
  }

  /**
   * Adds the next page of the platform, and says so. A search still waiting for its pause goes
   * instead: its first page replaces the list.
   */
  loadMore(): boolean {
    if (!sameLists(this.filters(), this.applied())) {
      this.load()
      return false
    }
    this.loading?.unsubscribe()
    this.more.set('loading')
    this.loading = this.api.platform(this.filters(), this.platform().length).subscribe({
      next: ({ courses, total }) => {
        this.platform.update((loaded) => [...loaded, ...courses])
        this.platformTotal.set(total)
        this.more.set('idle')
      },
      error: (error: unknown) => {
        console.error(error)
        this.more.set('error')
      },
    })
    return true
  }

  /**
   * Archives a course for the person, or brings it back, at once; puts it back if the server refuses.
   * A course a student brings back gets its activities again: those of their archives are not loaded.
   */
  async archive(course: Course, archived: boolean): Promise<boolean> {
    const [from, to] = archived ? [this.current, this.archived] : [this.archived, this.current]
    const before = { from: from(), to: to() }
    from.update((courses) => courses.filter(({ id }) => id !== course.id))
    to.update((courses) => [course, ...courses])
    try {
      await firstValueFrom(this.api.archive(course.id, archived))
    } catch (error) {
      console.error(error)
      from.set(before.from)
      to.set(before.to)
      return false
    }
    if (!archived && !this.teaches) this.refreshActivities(course.id)
    return true
  }

  create(name: string, desc: string): Promise<Course> {
    return firstValueFrom(this.api.create(name, desc))
  }

  private refreshActivities(courseId: string): void {
    this.missing.update((missing) => new Set(missing).add(courseId))
    this.refreshing?.unsubscribe()
    this.refreshing = this.api.activities().subscribe({
      next: (activities) => {
        this.activities.set(activities)
        this.missing.set(new Set())
      },
      error: (error: unknown) => console.error(error),
    })
  }

  private load(): void {
    this.loading?.unsubscribe()
    clearTimeout(this.searching)
    this.status.set('loading')
    this.more.set('idle')
    const filters = this.filters()
    const known = this.activities()
    const lists: Observable<Lists> = defer(() =>
      forkJoin({
        current: this.api.mine(filters, false),
        archived: this.api.mine(filters, true),
        activities: this.teaches ? of(undefined) : known ? of(known) : this.api.activities(),
        platform: filters.tab === 'platform' ? this.api.platform(filters, 0) : of(undefined),
      })
    )
    this.loading = lists.pipe(patiently()).subscribe({
      next: ({ current, archived, activities, platform }) => {
        this.current.set(current)
        this.archived.set(archived)
        this.activities.set(activities)
        if (platform) {
          this.platform.set(platform.courses)
          this.platformTotal.set(platform.total)
        }
        this.applied.set(filters)
        this.loaded.set(true)
        this.status.set('ready')
      },
      error: (error: unknown) => {
        console.error(error)
        this.status.set('error')
      },
    })
  }
}
