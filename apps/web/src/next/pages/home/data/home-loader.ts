import { inject, signal } from '@angular/core'
import { LoadStatus } from '@platon/design-system'
import { Announcement } from '@platon/feature/announcement/common'
import { catchError, defer, Observable, of, Subscription, timeout } from 'rxjs'
import { patiently } from '../../../shared/patiently'
import { HomeApi } from './home-api'

/** What every home loads beside its own data: the announcements of its banner. */
export interface HomeSources {
  readonly announcements: Announcement[]
}

/** The announcements only decorate the page: it does not wait for them longer. */
const ANNOUNCEMENTS_WAIT = 3_000

/**
 * The store of a home, provided by its route. It loads its sources together and, while the page says
 * « Nous réessayons », really tries again: a failure that may pass is tried again after a short wait,
 * until the page says it failed, at 30 s. The announcements only decorate the page: when they fail or
 * are late, the banner is left out.
 */
export abstract class HomeLoader<T extends HomeSources> {
  protected readonly api = inject(HomeApi)
  private loading?: Subscription

  readonly status = signal<LoadStatus>('idle')
  readonly data = signal<T | undefined>(undefined)
  /** The announcements read during this visit, before the server says so: the banners closed. */
  readonly read = signal<ReadonlySet<string>>(new Set())
  /** Changes on each « Réessayer », so that the loading phase starts its clock again. */
  readonly attempt = signal(0)

  /** The sources of one try, every one asked again on each try. */
  protected abstract sources(): Observable<T>

  /** The announcements, given up after a short wait or a failure. */
  protected announcements(): Observable<Announcement[]> {
    return this.api.announcements().pipe(
      timeout(ANNOUNCEMENTS_WAIT),
      catchError(() => of([]))
    )
  }

  load(): void {
    this.loading?.unsubscribe()
    this.status.set('loading')

    this.loading = defer(() => this.sources())
      .pipe(patiently())
      .subscribe({
        next: (data) => {
          this.data.set(data)
          this.status.set('ready')
        },
        error: (error: unknown) => {
          console.error(error)
          this.status.set('error')
        },
      })
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

  /** Closes the banner of an announcement for good: it is read, on every device of the person. */
  dismissAnnouncement(id: string): void {
    this.read.update((read) => new Set([...read, id]))
    this.api.markAnnouncementRead(id).subscribe({ error: (error: unknown) => console.error(error) })
  }
}
