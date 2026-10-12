import { MessageEvent } from '@nestjs/common'
import { sign } from 'jsonwebtoken'
import { Subject } from 'rxjs'
import { IRequest } from '../auth/auth.types'
import { eventStream } from './event-stream'

const requestWith = (expiresIn?: number): IRequest => {
  const token = sign({ sub: 'u1' }, 'secret', expiresIn ? { expiresIn } : {})
  return { headers: { authorization: `Bearer ${token}` } } as unknown as IRequest
}

describe('eventStream', () => {
  let events: Subject<{ unreadCount: number }>
  let messages: MessageEvent[]
  let ended: boolean

  const open = (req: IRequest) =>
    eventStream(req, events).subscribe({
      next: (message) => messages.push(message),
      complete: () => (ended = true),
    })

  beforeEach(() => {
    // On a whole second: a token counts its lifetime in seconds.
    jest.useFakeTimers({ now: new Date('2026-10-09T12:00:00Z') })
    events = new Subject()
    messages = []
    ended = false
  })

  afterEach(() => jest.useRealTimers())

  it('opens the stream with a comment, then sends each event as a message', () => {
    open(requestWith(900))

    events.next({ unreadCount: 2 })

    expect(messages).toEqual([{ comment: '' }, { data: { unreadCount: 2 } }])
  })

  it('sends a comment every 25 s', () => {
    open(requestWith(900))

    jest.advanceTimersByTime(24_999)
    expect(messages).toHaveLength(1)
    jest.advanceTimersByTime(1)
    expect(messages).toEqual([{ comment: '' }, { comment: '' }])
    jest.advanceTimersByTime(25_000)
    expect(messages).toHaveLength(3)
  })

  it('ends the stream when the access token that opened it expires, and stops following the events', () => {
    open(requestWith(60))

    jest.advanceTimersByTime(59_999)
    expect(ended).toBe(false)
    jest.advanceTimersByTime(1)

    expect(ended).toBe(true)
    expect(events.observed).toBe(false)
  })

  it('ends the stream without an error when the events fail, telling the client nothing', () => {
    open(requestWith(900))

    events.error(new Error('connection terminated unexpectedly'))

    expect(ended).toBe(true)
    expect(messages).toEqual([{ comment: '' }])
  })

  it('ends the stream with the events', () => {
    open(requestWith(900))

    events.complete()

    expect(ended).toBe(true)
    jest.advanceTimersByTime(60_000)
    expect(messages).toHaveLength(1)
  })

  it('stops following the events when the connection closes', () => {
    const subscription = open(requestWith(900))

    subscription.unsubscribe()

    expect(events.observed).toBe(false)
    jest.advanceTimersByTime(60_000)
    expect(messages).toHaveLength(1)
  })
})
