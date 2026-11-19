import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor, EventStreamClient, StreamEvent } from '@platon/core/browser/shared'
import { Notification, NotificationChange } from '@platon/feature/notification/common'
import { Observable, Subject } from 'rxjs'
import { NotificationPagination } from '../models/notification.model'
import { NotificationService } from './notification.service'

const at = '2026-10-09T12:00:00.000Z'

const revive = (_: string, value: unknown) => (value === at ? new Date(at) : value)

/** A notification as the API sends it, its dates as strings. */
const sent = (id: string, readAt: string | null = null) => ({
  id,
  userId: 'me',
  createdAt: at,
  updatedAt: at,
  readAt,
  data: { type: 'COURSE-MEMBER-CREATION' },
})

const decoded = (id: string, readAt: Date | null = null): Notification => ({
  id,
  userId: 'me',
  createdAt: new Date(at),
  updatedAt: new Date(at),
  readAt,
  data: { type: 'COURSE-MEMBER-CREATION' },
})

describe('NotificationService', () => {
  let http: HttpTestingController
  let stream: Subject<StreamEvent<unknown>>
  let connections: number
  let service: NotificationService

  const opened = () => stream.next({ kind: 'opened' })
  /** A change as the stream client gives it: the JSON read, the ISO dates turned into dates. */
  const change = (value: object) =>
    stream.next({ kind: 'message', type: 'message', data: JSON.parse(JSON.stringify(value), revive) })

  const list = (url: string, resources: object[], total = resources.length) =>
    http.expectOne(url).flush({ success: true, statusCode: 200, resources, total })

  beforeEach(() => {
    stream = new Subject()
    connections = 0
    const events = {
      open: () =>
        new Observable<StreamEvent<unknown>>((subscriber) => {
          connections++
          const subscription = stream.subscribe(subscriber)
          return () => {
            connections--
            subscription.unsubscribe()
          }
        }),
    }
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DateConversionInterceptor, multi: true },
        { provide: EventStreamClient, useValue: events },
      ],
    })
    http = TestBed.inject(HttpTestingController)
    service = TestBed.inject(NotificationService)
  })

  afterEach(() => http.verify())

  it('lists the notifications a filter keeps, with their dates as dates', () => {
    let resources: Notification[] = []
    let total = 0

    service.list({ excludeSignals: true, offset: 20, limit: 20 }).subscribe((page) => {
      resources = page.resources
      total = page.total
    })
    list('/api/v1/notifications?excludeSignals=true&offset=20&limit=20', [sent('n1', at)], 41)

    expect(resources).toEqual([decoded('n1', new Date(at))])
    expect(total).toBe(41)
  })

  it('reads the unread count', () => {
    let count = 0

    service.unreadCount().subscribe((value) => (count = value))
    http.expectOne('/api/v1/notifications/unread-count').flush({ success: true, statusCode: 200, resource: 4 })

    expect(count).toBe(4)
  })

  it('gives the changes of the stream, and only them', () => {
    const changes: NotificationChange[] = []

    service.changes().subscribe((value) => changes.push(value))
    opened()
    change({ unreadCount: 2 })
    stream.next({ kind: 'message', type: 'presence', data: { userId: 'u2' } })
    change({ unreadCount: 3, notification: sent('n1') })

    expect(changes).toEqual([{ unreadCount: 2 }, { unreadCount: 3, notification: decoded('n1') }])
  })

  it('shares one connection between its subscribers, and closes it once they have all left', () => {
    const first = service.changes().subscribe()
    const second = service.paginate().subscribe()
    expect(connections).toBe(1)

    first.unsubscribe()
    expect(connections).toBe(1)
    second.unsubscribe()
    expect(connections).toBe(0)
    http.expectOne('/api/v1/notifications?limit=20')
  })

  it('gives a subscriber that arrives late the last count of the stream', () => {
    service.changes().subscribe()
    change({ unreadCount: 2 })
    const late: NotificationChange[] = []

    service.changes().subscribe((value) => late.push(value))

    expect(late).toEqual([{ unreadCount: 2 }])
  })

  it('sends each change to the API', () => {
    service.markAsRead('n1').subscribe()
    service.markAllAsRead().subscribe()
    service.deleteNotification('n1').subscribe()
    service.deleteAllNotifications().subscribe()

    http.expectOne({ method: 'PATCH', url: '/api/v1/notifications/n1/read' })
    http.expectOne({ method: 'PATCH', url: '/api/v1/notifications/read' })
    http.expectOne({ method: 'DELETE', url: '/api/v1/notifications/n1' })
    http.expectOne({ method: 'DELETE', url: '/api/v1/notifications' })
  })

  describe('paginate', () => {
    let pages: NotificationPagination[]
    const last = () => pages[pages.length - 1]

    beforeEach(() => {
      pages = []
      service.paginate(2).subscribe((page) => pages.push(page))
    })

    it('loads the first page, signals included, then adds each notification that arrives with the count', () => {
      change({ unreadCount: 1 })
      expect(pages).toEqual([])

      list('/api/v1/notifications?limit=2', [sent('n2'), sent('n1')], 3)
      expect(last()).toEqual(
        expect.objectContaining({ notifications: [decoded('n2'), decoded('n1')], hasMore: true, unreadCount: 1 })
      )

      change({ unreadCount: 2, notification: sent('n3') })
      expect(last()).toEqual(
        expect.objectContaining({
          notifications: [decoded('n3'), decoded('n2'), decoded('n1')],
          hasMore: true,
          unreadCount: 2,
        })
      )
    })

    it('reads the first page again when the stream opens again, and shows first what arrived meanwhile', () => {
      opened()
      list('/api/v1/notifications?limit=2', [sent('n2'), sent('n1')], 2)

      opened()
      list('/api/v1/notifications?limit=2', [sent('n4'), sent('n3')], 4)

      expect(last().notifications.map(({ id }) => id)).toEqual(['n4', 'n3', 'n2', 'n1'])
      expect(last().hasMore).toBe(false)
    })

    it('loads more after the notifications it holds, without repeating one', () => {
      list('/api/v1/notifications?limit=2', [sent('n3'), sent('n2')], 4)
      change({ unreadCount: 2, notification: sent('n4') })

      last().fetchMore()
      list('/api/v1/notifications?offset=3&limit=2', [sent('n2'), sent('n1')], 5)

      expect(last().notifications.map(({ id }) => id)).toEqual(['n4', 'n3', 'n2', 'n1'])
      expect(last().hasMore).toBe(true)
    })

    it('shows the notifications read and deleted from any screen', () => {
      list('/api/v1/notifications?limit=2', [sent('n2'), sent('n1')], 3)

      service.markAsRead('n1').subscribe()
      http.expectOne('/api/v1/notifications/n1/read').flush(null)
      expect(last().notifications[1].readAt).toBeInstanceOf(Date)
      expect(last().notifications[0].readAt).toBeNull()

      service.deleteNotification('n1').subscribe()
      http.expectOne('/api/v1/notifications/n1').flush(null)
      expect(last().notifications.map(({ id }) => id)).toEqual(['n2'])
      expect(last().hasMore).toBe(true)

      service.markAllAsRead().subscribe()
      http.expectOne('/api/v1/notifications/read').flush(null)
      expect(last().notifications[0].readAt).toBeInstanceOf(Date)

      service.deleteAllNotifications().subscribe()
      http.expectOne({ method: 'DELETE', url: '/api/v1/notifications' }).flush(null)
      expect(last().notifications).toEqual([])
      expect(last().hasMore).toBe(false)
    })

    it('asks the first page again after a failure, waiting longer each time', () => {
      jest.useFakeTimers()
      try {
        http.expectOne('/api/v1/notifications?limit=2').flush(null, { status: 502, statusText: 'Bad Gateway' })
        jest.advanceTimersByTime(999)
        http.expectNone('/api/v1/notifications?limit=2')
        jest.advanceTimersByTime(1)
        http.expectOne('/api/v1/notifications?limit=2').flush(null, { status: 502, statusText: 'Bad Gateway' })
        jest.advanceTimersByTime(2_000)
        list('/api/v1/notifications?limit=2', [sent('n1')], 1)

        expect(last().notifications).toEqual([decoded('n1')])
      } finally {
        jest.useRealTimers()
      }
    })
  })
})
