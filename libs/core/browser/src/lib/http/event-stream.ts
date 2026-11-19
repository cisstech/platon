import { HttpErrorResponse } from '@angular/common/http'
import { Injectable, NgZone, inject } from '@angular/core'
import { TOKEN_EXPIRED_ERROR_CODE } from '@platon/core/common'
import {
  EMPTY,
  Observable,
  catchError,
  defer,
  from,
  fromEvent,
  race,
  repeat,
  retry,
  switchMap,
  takeUntil,
  tap,
  throwError,
  timeout,
  timer,
} from 'rxjs'
import { TokenService } from '../auth/api/token.service'
import { convertIsoDates } from './utils'

/**
 * A connection has just opened, before the events of the server: what the server sent while the
 * stream was closed is lost, and a consumer may read it again.
 */
export interface StreamOpened {
  readonly kind: 'opened'
}

/** An event of the server, its JSON data read and its ISO dates turned into dates. */
export interface StreamMessage<T> {
  readonly kind: 'message'
  /** `message` unless the server names the event. */
  readonly type: string
  readonly data: T
}

export type StreamEvent<T> = StreamOpened | StreamMessage<T>

/** An event as the text of the stream carries it. */
interface RawEvent {
  readonly type: string
  readonly data: string
}

/** The waits before opening a stream again, longer after each failure in a row. */
const RECONNECT_DELAYS = [1_000, 2_000, 5_000, 10_000, 30_000]

/** A connection that lasted this long was healthy: when it ends, the stream opens again at once. */
const HEALTHY_FOR = 10_000

/**
 * The server sends a comment every 25 s: a stream silent for a minute is dead without knowing it, as
 * after a laptop wakes up or the network changes.
 */
const SILENCE_LIMIT = 60_000

/** A token refresh that hangs gives way to a new attempt. */
const REFRESH_LIMIT = 15_000

/** Spreads the reconnections of many tabs after the API restarts. */
const withJitter = (delay: number): number => Math.round(delay * (0.8 + 0.4 * Math.random()))

/** The session is over: the stream stops for good, without an error. */
class SessionEnded extends Error {}

class TokenExpired extends Error {}

/** Whether a failed refresh means the session is over, rather than an API that did not answer. */
const sessionIsOver = (error: unknown): boolean =>
  error instanceof HttpErrorResponse
    ? error.status === 401 || error.status === 403
    : error instanceof Error && error.message.startsWith('auth/')

/**
 * Splits a server-sent event stream into its events, as its text arrives in pieces cut anywhere.
 * Comments, `id` and `retry` are skipped.
 */
class EventStreamParser {
  private buffer = ''
  private type = ''
  private data: string[] = []

  push(text: string): RawEvent[] {
    const events: RawEvent[] = []
    const pending = this.buffer + text
    // A carriage return at the very end may be the first half of a CRLF: it waits for the next piece.
    const end = pending.endsWith('\r') ? pending.length - 1 : pending.length
    const lines = pending.slice(0, end).split(/\r\n|\r|\n/)
    this.buffer = (lines.pop() ?? '') + pending.slice(end)
    for (const line of lines) this.read(line, events)
    return events
  }

  private read(line: string, events: RawEvent[]): void {
    if (line === '') {
      if (this.data.length) events.push({ type: this.type || 'message', data: this.data.join('\n') })
      this.type = ''
      this.data = []
      return
    }
    if (line.startsWith(':')) return
    const colon = line.indexOf(':')
    const field = colon < 0 ? line : line.slice(0, colon)
    const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '')
    if (field === 'data') this.data.push(value)
    else if (field === 'event') this.type = value
  }
}

/** The event with its JSON data read, or nothing when the data is not JSON. */
const decode = <T>({ type, data }: RawEvent): StreamMessage<T> | undefined => {
  try {
    return { kind: 'message', type, data: convertIsoDates(JSON.parse(data) as T) }
  } catch {
    console.error(`Unreadable event ${type} in a stream`, data)
    return undefined
  }
}

/**
 * Opens server-sent event streams of JSON data with the Bearer token of the session, which
 * `EventSource` cannot send. Each event comes with its data read, ISO dates as dates, as `HttpClient`
 * gives a response; an event that is not JSON is skipped. A stream that ends opens again: at once after a healthy connection, otherwise after a wait
 * that grows with the failures in a row, or as soon as the device comes back online. An expired token
 * is refreshed first. The stream stops for good when the session is over or the person signs out.
 *
 * The network work runs outside the Angular zone, so that a heartbeat does not check the whole page:
 * only the events re-enter it.
 */
@Injectable({ providedIn: 'root' })
export class EventStreamClient {
  private readonly tokens = inject(TokenService)
  private readonly zone = inject(NgZone)

  open<T>(url: string): Observable<StreamEvent<T>> {
    return defer(() => {
      let failures = 0
      let openedAt: number | undefined
      const reopen = () => {
        const healthy = openedAt !== undefined && Date.now() - openedAt >= HEALTHY_FOR
        openedAt = undefined
        if (healthy) {
          failures = 0
          return timer(0)
        }
        const delay = RECONNECT_DELAYS[Math.min(failures++, RECONNECT_DELAYS.length - 1)]
        return race(timer(withJitter(delay)), fromEvent(window, 'online'))
      }
      return this.connect<T>(url).pipe(
        tap((event) => {
          if (event.kind === 'opened') openedAt = Date.now()
        }),
        repeat({ delay: reopen }),
        retry({ delay: (error: unknown) => (error instanceof SessionEnded ? throwError(() => error) : reopen()) }),
        catchError((error: unknown) => (error instanceof SessionEnded ? EMPTY : throwError(() => error))),
        takeUntil(this.tokens.signedOut)
      )
    })
  }

  private connect<T>(url: string): Observable<StreamEvent<T>> {
    return from(this.tokens.token()).pipe(
      switchMap((token) => {
        if (!token) throw new SessionEnded()
        return this.request<T>(url, token.accessToken)
      }),
      catchError((error: unknown) =>
        error instanceof TokenExpired
          ? from(this.tokens.refresh()).pipe(
              timeout(REFRESH_LIMIT),
              catchError((failure: unknown) =>
                throwError(() => (sessionIsOver(failure) ? new SessionEnded() : failure))
              ),
              switchMap((token) => this.request<T>(url, token.accessToken))
            )
          : throwError(() => error)
      )
    )
  }

  /** The events of one connection: it ends with the response, and is cancelled on unsubscribe. */
  private request<T>(url: string, accessToken: string): Observable<StreamEvent<T>> {
    return new Observable<StreamEvent<T>>((subscriber) => {
      const abort = new AbortController()
      const next = (event: StreamEvent<T>) => this.zone.run(() => subscriber.next(event))
      let silence: ReturnType<typeof setTimeout> | undefined
      const listen = () => {
        clearTimeout(silence)
        silence = setTimeout(() => {
          abort.abort()
          this.zone.run(() => subscriber.error(new Error(`The stream ${url} fell silent`)))
        }, SILENCE_LIMIT)
      }
      this.zone.runOutsideAngular(() => {
        listen()
        fetch(url, {
          headers: { Accept: 'text/event-stream', Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
          signal: abort.signal,
        })
          .then((response) => {
            if (response.status === 401) {
              return response.json().then(
                (body: { message?: unknown }) => {
                  throw body?.message === TOKEN_EXPIRED_ERROR_CODE ? new TokenExpired() : new SessionEnded()
                },
                () => {
                  throw new SessionEnded()
                }
              )
            }
            if (!response.ok || !response.body) throw new Error(`The stream ${url} answered ${response.status}`)
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            const parser = new EventStreamParser()
            const pump = (): Promise<void> =>
              reader.read().then(({ done, value }) => {
                if (done) return
                listen()
                for (const raw of parser.push(decoder.decode(value, { stream: true }))) {
                  const event = decode<T>(raw)
                  if (event) next(event)
                }
                return pump()
              })
            listen()
            next({ kind: 'opened' })
            return pump()
          })
          .then(
            () => this.zone.run(() => subscriber.complete()),
            (error: unknown) => this.zone.run(() => subscriber.error(error))
          )
      })
      return () => {
        clearTimeout(silence)
        abort.abort()
      }
    })
  }
}
