import { HttpErrorResponse } from '@angular/common/http'
import { inject, signal } from '@angular/core'
import { LOAD_DELAYS, LoadStatus } from '@platon/design-system'
import { Announcement } from '@platon/feature/announcement/common'
import { catchError, defer, Observable, of, retry, Subscription, throwError, timeout, timer } from 'rxjs'
import { HomeApi } from './home-api'

/** What every home loads beside its own data: the announcements of its banner. */
export interface HomeSources {
  readonly announcements: Announcement[]
}

/** When the page says it failed, the store stops trying, the try under way included. */
const GIVE_UP_AFTER = LOAD_DELAYS.timeout
/** The waits between two tries, the last one repeated. */
const RETRY_DELAYS = [1_000, 2_000, 5_000]
/** The announcements only decorate the page: it does not wait for them longer. */
const ANNOUNCEMENTS_WAIT = 3_000

/** A failure that may pass: the network, or the server down. A refusal (4xx) will not. */
const mayPass = (error: unknown) => !(error instanceof HttpErrorResponse) || error.status === 0 || error.status >= 500

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
  /** The announcements closed in this browser. */
  readonly dismissed = signal<ReadonlySet<string>>(new Set())
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
    this.dismissed.set(this.api.dismissedAnnouncements())

    this.loading = defer(() => this.sources())
      .pipe(
        retry({
          delay: (error: unknown, count: number) =>
            mayPass(error) ? timer(RETRY_DELAYS[Math.min(count, RETRY_DELAYS.length) - 1]) : throwError(() => error),
        }),
        timeout({ first: GIVE_UP_AFTER })
      )
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

  dismissAnnouncement(id: string): void {
    this.api.dismissAnnouncement(id)
    this.dismissed.update((dismissed) => new Set([...dismissed, id]))
  }
}
