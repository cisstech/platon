import { Logger, MessageEvent } from '@nestjs/common'
import { decode } from 'jsonwebtoken'
import { ExtractJwt } from 'passport-jwt'
import { Observable } from 'rxjs'
import { IRequest } from '../auth/auth.types'

/** Shorter than the 60 s after which a proxy closes a connection that says nothing. */
const HEARTBEAT_INTERVAL = 25_000

const logger = new Logger('EventStream')

/** The longest delay `setTimeout` accepts. */
const MAX_DELAY = 2 ** 31 - 1

/** When the access token of the request expires, in milliseconds; the guard has verified it already. */
const tokenExpiry = (req: IRequest): number | undefined => {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  const payload = token ? decode(token) : null
  return payload && typeof payload === 'object' && payload.exp ? payload.exp * 1000 : undefined
}

/**
 * The messages of a `@Sse` route: a comment at once, so that the headers leave without waiting for
 * the first event, then each event, and a comment every 25 s so that no proxy closes the idle
 * connection. The stream ends when the access token that opened it expires: the client opens it
 * again with a fresh token, so a stream never outlives the session that opened it. It also ends,
 * logged, when the events fail: the client reopens it, and the error text stays on the server.
 */
export const eventStream = <T extends object>(req: IRequest, events: Observable<T>): Observable<MessageEvent> =>
  new Observable<MessageEvent>((subscriber) => {
    subscriber.next({ comment: '' })
    const heartbeat = setInterval(() => subscriber.next({ comment: '' }), HEARTBEAT_INTERVAL)
    const expiry = tokenExpiry(req)
    const end =
      expiry === undefined
        ? undefined
        : setTimeout(() => subscriber.complete(), Math.min(Math.max(expiry - Date.now(), 0), MAX_DELAY))
    const subscription = events.subscribe({
      next: (data) => subscriber.next({ data }),
      error: (error: unknown) => {
        logger.error(error instanceof Error ? error.stack ?? error.message : error)
        subscriber.complete()
      },
      complete: () => subscriber.complete(),
    })
    return () => {
      clearInterval(heartbeat)
      clearTimeout(end)
      subscription.unsubscribe()
    }
  })
