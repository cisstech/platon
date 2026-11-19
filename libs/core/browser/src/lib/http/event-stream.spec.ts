import { HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { AuthToken, TOKEN_EXPIRED_ERROR_CODE } from '@platon/core/common'
import { Subject, Subscription } from 'rxjs'
import { TokenService } from '../auth/api/token.service'
import { EventStreamClient, StreamEvent } from './event-stream'

/** The body of an open stream, written by the test chunk by chunk as the network would. */
class Body {
  private readonly encoder = new TextEncoder()
  private readonly results: (ReadableStreamReadResult<Uint8Array> | Error)[] = []
  private waiter?: { resolve: (result: ReadableStreamReadResult<Uint8Array>) => void; reject: (error: Error) => void }

  readonly reader = {
    read: () =>
      new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
        const next = this.results.shift()
        if (!next) this.waiter = { resolve, reject }
        else if (next instanceof Error) reject(next)
        else resolve(next)
      }),
  }

  write(text: string): void {
    this.push({ done: false, value: this.encoder.encode(text) })
  }

  end(): void {
    this.push({ done: true, value: undefined })
  }

  fail(): void {
    this.push(new TypeError('network error'))
  }

  private push(result: ReadableStreamReadResult<Uint8Array> | Error): void {
    const waiter = this.waiter
    if (!waiter) {
      this.results.push(result)
      return
    }
    this.waiter = undefined
    if (result instanceof Error) waiter.reject(result)
    else waiter.resolve(result)
  }
}

const opened = (body: Body) => Promise.resolve({ ok: true, status: 200, body: { getReader: () => body.reader } })

const refused = (status: number, message = 'refused') =>
  Promise.resolve({ ok: false, status, body: null, json: () => Promise.resolve({ statusCode: status, message }) })

describe('EventStreamClient', () => {
  let fetch: jest.Mock
  let tokens: { token: jest.Mock; refresh: jest.Mock; signedOut: Subject<void> }
  let events: StreamEvent<unknown>[]
  let ended: boolean
  let subscription: Subscription | undefined

  const open = () => {
    subscription = TestBed.inject(EventStreamClient)
      .open('/api/v1/notifications/stream')
      .subscribe({ next: (event) => events.push(event), complete: () => (ended = true) })
  }

  /** Runs the timers due in `ms`, and the promises they settle. */
  const wait = (ms = 0) => jest.advanceTimersByTimeAsync(ms)

  const authorization = (call: number) => fetch.mock.calls[call][1].headers.Authorization
  const aborted = (call: number) => fetch.mock.calls[call][1].signal.aborted
  const sent = () => events.filter((event) => event.kind === 'message')
  const openings = () => events.filter((event) => event.kind === 'opened').length

  beforeEach(() => {
    jest.useFakeTimers()
    // The waits are spread by up to 20% each way; in the middle, they are exact.
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    fetch = jest.fn()
    globalThis.fetch = fetch
    tokens = {
      token: jest.fn(() => Promise.resolve<AuthToken>({ accessToken: 'a1', refreshToken: 'r1' })),
      refresh: jest.fn(() => Promise.resolve<AuthToken>({ accessToken: 'a2', refreshToken: 'r1' })),
      signedOut: new Subject<void>(),
    }
    events = []
    ended = false
    TestBed.configureTestingModule({ providers: [{ provide: TokenService, useValue: tokens }] })
  })

  afterEach(() => {
    subscription?.unsubscribe()
    jest.useRealTimers()
    jest.restoreAllMocks()
    delete (globalThis as { fetch?: unknown }).fetch
  })

  it('asks for the stream with the access token of the session, and says when it opens', async () => {
    fetch.mockReturnValue(opened(new Body()))

    open()
    await wait()

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/notifications/stream',
      expect.objectContaining({
        headers: { Accept: 'text/event-stream', Authorization: 'Bearer a1' },
        cache: 'no-store',
      })
    )
    expect(events).toEqual([{ kind: 'opened' }])
  })

  it('reads the events as their pieces arrive, and skips the comments', async () => {
    const body = new Body()
    fetch.mockReturnValue(opened(body))
    open()
    await wait()

    body.write('﻿\n: \n\nid: 1\nda')
    body.write('ta: {"unreadCount"')
    body.write(':2}\n\nevent: change\ndata: {"first":\r')
    body.write('\ndata: 1}\r\n\r\n')
    body.write('data:[1,\rdata:2]\r\revent: ignored\n\ndata: "after a nameless one"\n\n')
    await wait()

    expect(sent()).toEqual([
      { kind: 'message', type: 'message', data: { unreadCount: 2 } },
      { kind: 'message', type: 'change', data: { first: 1 } },
      { kind: 'message', type: 'message', data: [1, 2] },
      { kind: 'message', type: 'message', data: 'after a nameless one' },
    ])
  })

  it('gives the ISO dates of the data as dates, and skips an event that is not JSON', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const body = new Body()
    fetch.mockReturnValue(opened(body))
    open()
    await wait()

    body.write('data: not json\n\n')
    body.write('data: {"notification":{"createdAt":"2026-10-09T12:00:00.000Z","data":{"code":"2026"}}}\n\n')
    await wait()

    expect(sent()).toEqual([
      {
        kind: 'message',
        type: 'message',
        data: { notification: { createdAt: new Date('2026-10-09T12:00:00.000Z'), data: { code: '2026' } } },
      },
    ])
    expect(console.error).toHaveBeenCalled()
  })

  it('waits longer after each failure in a row', async () => {
    fetch
      .mockReturnValueOnce(Promise.reject(new TypeError('network error')))
      .mockReturnValueOnce(refused(502))
      .mockReturnValue(opened(new Body()))
    open()
    await wait()
    expect(fetch).toHaveBeenCalledTimes(1)

    await wait(999)
    expect(fetch).toHaveBeenCalledTimes(1)
    await wait(1)
    expect(fetch).toHaveBeenCalledTimes(2)
    await wait(1_999)
    expect(fetch).toHaveBeenCalledTimes(2)
    await wait(1)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(ended).toBe(false)
  })

  it('spreads the waits of the tabs around their length', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0)
    fetch.mockReturnValueOnce(Promise.reject(new TypeError('network error'))).mockReturnValue(opened(new Body()))
    open()
    await wait()

    await wait(799)
    expect(fetch).toHaveBeenCalledTimes(1)
    await wait(1)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('opens the stream again at once after a healthy connection, and backs off after a short one', async () => {
    const healthy = new Body()
    const short = new Body()
    fetch.mockReturnValueOnce(opened(healthy)).mockReturnValueOnce(opened(short)).mockReturnValue(opened(new Body()))
    open()
    await wait()

    await wait(10_000)
    healthy.write('data: 1\n\n')
    healthy.end()
    await wait()
    expect(fetch).toHaveBeenCalledTimes(2)

    short.end()
    await wait(999)
    expect(fetch).toHaveBeenCalledTimes(2)
    await wait(1)
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(openings()).toBe(3)
  })

  it('opens the stream again when the connection drops in the middle', async () => {
    const first = new Body()
    fetch.mockReturnValueOnce(opened(first)).mockReturnValue(opened(new Body()))
    open()
    await wait()

    first.write('data: 1\n\n')
    first.fail()
    await wait(1_000)

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('opens the stream again when the server falls silent for a minute, its heartbeats included', async () => {
    const silent = new Body()
    fetch.mockReturnValueOnce(opened(silent)).mockReturnValue(opened(new Body()))
    open()
    await wait()

    await wait(30_000)
    silent.write(': \n\n')
    await wait(59_999)
    expect(fetch).toHaveBeenCalledTimes(1)
    await wait(1)
    await wait(1_000)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(aborted(0)).toBe(true)
  })

  it('gives up a request that the server never answers, after a minute', async () => {
    fetch.mockReturnValueOnce(new Promise(() => undefined)).mockReturnValue(opened(new Body()))
    open()
    await wait()

    await wait(60_000)
    await wait(1_000)

    expect(aborted(0)).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('opens the stream again at once when the device comes back online', async () => {
    fetch.mockReturnValueOnce(Promise.reject(new TypeError('offline'))).mockReturnValue(opened(new Body()))
    open()
    await wait()

    window.dispatchEvent(new Event('online'))
    await wait()

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('refreshes an expired token, then opens the stream with the new one', async () => {
    fetch.mockReturnValueOnce(refused(401, TOKEN_EXPIRED_ERROR_CODE)).mockReturnValue(opened(new Body()))

    open()
    await wait()

    expect(tokens.refresh).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(authorization(1)).toBe('Bearer a2')
  })

  it('tries again later when the refresh fails or hangs while the session lives', async () => {
    fetch.mockReturnValue(refused(401, TOKEN_EXPIRED_ERROR_CODE))
    tokens.refresh
      .mockReturnValueOnce(Promise.reject(new HttpErrorResponse({ status: 502 })))
      .mockReturnValueOnce(new Promise(() => undefined))
    open()
    await wait()
    expect(tokens.refresh).toHaveBeenCalledTimes(1)

    await wait(1_000)
    expect(tokens.refresh).toHaveBeenCalledTimes(2)
    await wait(15_000)
    await wait(2_000)

    expect(tokens.refresh).toHaveBeenCalledTimes(3)
    expect(ended).toBe(false)
  })

  it('stops for good without a session, when the token is refused, or when the session cannot be renewed', async () => {
    tokens.token.mockResolvedValueOnce(undefined)
    open()
    await wait(60_000)
    expect(ended).toBe(true)
    expect(fetch).not.toHaveBeenCalled()

    ended = false
    fetch.mockReturnValueOnce(refused(401, 'Unauthorized'))
    open()
    await wait(60_000)
    expect(ended).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)

    ended = false
    fetch.mockReturnValueOnce(refused(401, TOKEN_EXPIRED_ERROR_CODE))
    tokens.refresh.mockRejectedValueOnce(new Error('auth/refresh-token-expired'))
    open()
    await wait(60_000)
    expect(ended).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('ends an open stream when the person signs out', async () => {
    fetch.mockReturnValue(opened(new Body()))
    open()
    await wait()

    tokens.signedOut.next()
    await wait(60_000)

    expect(ended).toBe(true)
    expect(aborted(0)).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('cancels the request and opens nothing more once unsubscribed', async () => {
    fetch.mockReturnValue(opened(new Body()))
    open()
    await wait()

    subscription?.unsubscribe()
    await wait(60_000)

    expect(aborted(0)).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
