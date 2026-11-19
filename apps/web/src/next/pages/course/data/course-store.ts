import { HttpErrorResponse } from '@angular/common/http'
import { computed, inject, Injectable, signal } from '@angular/core'
import { LoadStatus } from '@platon/design-system'
import { Course, CourseSection, PlayableActivity, TaughtActivity } from '@platon/feature/course/common'
import { defer, forkJoin, map, Observable, Subscription, switchMap } from 'rxjs'
import { patiently } from '../../../shared/patiently'
import { StateFilter, teaches } from '../course.vm'
import { CourseApi } from './course-api'

interface Page {
  readonly course: Course
  readonly sections: CourseSection[]
  readonly taught: TaughtActivity[]
  readonly playable: PlayableActivity[]
}

/** A course that is not there, or not the person's: the address is wrong, or not for them. */
const isMissing = (error: unknown) => error instanceof HttpErrorResponse && [400, 403, 404].includes(error.status)

/**
 * The store of the page of a course, provided by its route. It loads the course and its sections
 * together, then its activities as its teacher reads them, or as a student plays them, after what the
 * course says the person may do. The search and the state filter of the overview live here.
 */
@Injectable()
export class CourseStore {
  private readonly api = inject(CourseApi)
  private loading?: Subscription
  private id = ''

  readonly status = signal<LoadStatus>('idle')
  /** Changes on each « Réessayer », so that the loading phase starts its clock again. */
  readonly attempt = signal(0)
  /** The course is not there, or the person is not one of its members. */
  readonly missing = signal(false)
  readonly course = signal<Course | undefined>(undefined)
  readonly sections = signal<CourseSection[]>([])
  /** Its activities for its teacher; none for a student. */
  readonly taught = signal<TaughtActivity[]>([])
  /** Its activities for a student; none for its teacher. */
  readonly playable = signal<PlayableActivity[]>([])
  readonly search = signal('')
  readonly state = signal<StateFilter>('all')
  readonly filters = computed(() => ({ search: this.search(), state: this.state() }))
  /** When the course was loaded: what the deadlines are measured from. */
  readonly now = signal(new Date())

  /** Loads the course `id`. The route keeps its store from one visit to the next: each visit starts afresh. */
  start(id: string): void {
    this.id = id
    this.missing.set(false)
    this.course.set(undefined)
    this.sections.set([])
    this.taught.set([])
    this.playable.set([])
    this.search.set('')
    this.state.set('all')
    this.load()
  }

  /** Stops loading: the page is gone. */
  stop(): void {
    this.loading?.unsubscribe()
  }

  /** Starts over, even while a load hangs: its late answer is then dropped. */
  retry(): void {
    this.attempt.update((attempt) => attempt + 1)
    this.load()
  }

  private load(): void {
    this.loading?.unsubscribe()
    this.now.set(new Date())
    this.status.set('loading')
    const id = this.id
    const page: Observable<Page> = defer(() =>
      forkJoin({ course: this.api.course(id), sections: this.api.sections(id) }).pipe(
        switchMap(({ course, sections }) =>
          teaches(course)
            ? this.api.taught(id).pipe(map((taught) => ({ course, sections, taught, playable: [] })))
            : this.api.playable(id).pipe(map((playable) => ({ course, sections, taught: [], playable })))
        )
      )
    )
    this.loading = page.pipe(patiently()).subscribe({
      next: ({ course, sections, taught, playable }) => {
        this.course.set(course)
        this.sections.set(sections)
        this.taught.set(taught)
        this.playable.set(playable)
        this.status.set('ready')
      },
      error: (error: unknown) => {
        if (isMissing(error)) {
          this.missing.set(true)
          this.status.set('ready')
          return
        }
        console.error(error)
        this.status.set('error')
      },
    })
  }
}
