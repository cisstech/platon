import { HttpErrorResponse } from '@angular/common/http'
import { LOAD_DELAYS } from '@platon/design-system'
import { MonoTypeOperatorFunction, retry, throwError, timeout, timer } from 'rxjs'

/** When the page says it failed, the store stops trying, the try under way included. */
const GIVE_UP_AFTER = LOAD_DELAYS.timeout
/** The waits between two tries, the last one repeated. */
const RETRY_DELAYS = [1_000, 2_000, 5_000]

/** A failure that may pass: the network, or the server down. A refusal (4xx) will not. */
const mayPass = (error: unknown) => !(error instanceof HttpErrorResponse) || error.status === 0 || error.status >= 500

/**
 * A load that really tries again while the page says « Nous réessayons »: a failure that may pass is
 * tried again after a short wait, until the page says it failed, at 30 s. A refusal fails at once.
 */
export const patiently =
  <T>(): MonoTypeOperatorFunction<T> =>
  (source) =>
    source.pipe(
      retry({
        delay: (error: unknown, count: number) =>
          mayPass(error) ? timer(RETRY_DELAYS[Math.min(count, RETRY_DELAYS.length) - 1]) : throwError(() => error),
      }),
      timeout({ first: GIVE_UP_AFTER })
    )
