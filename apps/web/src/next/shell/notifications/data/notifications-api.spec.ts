import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { DateConversionInterceptor, EventStreamClient, StreamEvent } from '@platon/core/browser/shared'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { Subject, firstValueFrom } from 'rxjs'
import { NotificationChange, NotificationPage, NotificationsApi } from './notifications-api'

const at = '2026-10-09T12:00:00.000Z'

const sent = (id: string) => ({
  id,
  userId: 'me',
  createdAt: at,
  updatedAt: at,
  readAt: null,
  data: { type: 'COURSE-MEMBER-CREATION' },
})

const sentPage = (from: number, count: number) => Array.from({ length: count }, (_, index) => sent(`n${from + index}`))

describe('NotificationsApi', () => {
  let http: HttpTestingController
  let stream: Subject<StreamEvent<unknown>>
  let api: NotificationsApi

  const respond = (url: string, resources: object[], total: number) =>
    http.expectOne(url).flush({ success: true, statusCode: 200, resources, total })

  beforeEach(() => {
    stream = new Subject()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: DateConversionInterceptor, multi: true },
        { provide: EventStreamClient, useValue: { open: () => stream } },
        { provide: ResourceService, useValue: {} },
      ],
    })
    http = TestBed.inject(HttpTestingController)
    api = TestBed.inject(NotificationsApi)
  })

  afterEach(() => http.verify())

  it('loads a page without the signals, and gives where the next one starts', async () => {
    const page = firstValueFrom(api.page())
    respond('/api/v1/notifications?excludeSignals=true&offset=0&limit=20', sentPage(0, 20), 45)

    expect(await page).toEqual<NotificationPage>(expect.objectContaining({ hasMore: true, cursor: '20', total: 45 }))
    expect((await page).notifications[0].createdAt).toEqual(new Date(at))

    const next = firstValueFrom(api.page('20'))
    respond('/api/v1/notifications?excludeSignals=true&offset=20&limit=20', sentPage(20, 20), 45)
    expect(await next).toEqual(expect.objectContaining({ hasMore: true, cursor: '40' }))

    const last = firstValueFrom(api.page('40'))
    respond('/api/v1/notifications?excludeSignals=true&offset=40&limit=20', sentPage(40, 5), 45)
    expect(await last).toEqual(expect.objectContaining({ hasMore: false, cursor: '45' }))
  })

  it('asks a long list again 50 at a time, the most the API gives, without repeating one at the seam', async () => {
    const page = firstValueFrom(api.page(null, 70))
    respond('/api/v1/notifications?excludeSignals=true&offset=0&limit=50', sentPage(0, 50), 80)
    respond('/api/v1/notifications?excludeSignals=true&offset=50&limit=20', sentPage(49, 20), 81)

    const { notifications, hasMore, cursor, total } = await page
    expect(notifications.map(({ id }) => id)).toEqual(sentPage(0, 69).map(({ id }) => id))
    expect({ hasMore, cursor, total }).toEqual({ hasMore: true, cursor: '70', total: 81 })
  })

  it('reads the unread count, and the changes of the stream', async () => {
    const count = firstValueFrom(api.unreadCount())
    http.expectOne('/api/v1/notifications/unread-count').flush({ success: true, statusCode: 200, resource: 3 })
    expect(await count).toBe(3)

    const changes: NotificationChange[] = []
    api.changes().subscribe((change) => changes.push(change))
    stream.next({ kind: 'message', type: 'message', data: { unreadCount: 4, notification: sent('n9') } })

    expect(changes).toEqual([{ unreadCount: 4, notification: expect.objectContaining({ id: 'n9' }) }])
  })
})
