import { TestBed } from '@angular/core/testing'
import { DialogService } from '@platon/core/browser/shared'
import { Notification } from '@platon/feature/notification/common'
import { Subject, of, throwError } from 'rxjs'
import { NotificationChange, NotificationPage, NotificationsApi } from './notifications-api'
import { NotificationsStore } from './notifications-store'

const at = new Date(2026, 8, 28, 12, 30)

const notification = (id: string, type = 'COURSE-MEMBER-CREATION', readAt: Date | null = null): Notification => ({
  id,
  userId: 'me',
  createdAt: at,
  updatedAt: at,
  readAt,
  data: { type, courseId: 'c1', courseName: 'Algorithmique' },
})

/** Lets the promises of the store settle. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

const page = (notifications: Notification[], hasMore = false, cursor: string | null = null, total = 0) =>
  of<NotificationPage>({ notifications, hasMore, cursor, total: total || notifications.length })

describe('NotificationsStore', () => {
  let api: { [K in keyof NotificationsApi]: jest.Mock }
  let messages: { confirm: jest.Mock; error: jest.Mock }
  let changes: Subject<NotificationChange>
  let store: NotificationsStore

  beforeEach(async () => {
    changes = new Subject()
    api = {
      unreadCount: jest.fn(() => of(3)),
      changes: jest.fn(() => changes),
      page: jest.fn(() => page([notification('n1'), notification('n2', 'COURSE-MEMBER-CREATION', at)])),
      markAsRead: jest.fn(() => of(true)),
      markAllAsRead: jest.fn(() => of(true)),
      delete: jest.fn(() => of(true)),
      deleteAll: jest.fn(() => of(true)),
      answerInvitation: jest.fn(() => of(undefined)),
    }
    messages = { confirm: jest.fn(), error: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        NotificationsStore,
        { provide: NotificationsApi, useValue: api },
        { provide: DialogService, useValue: messages },
      ],
    })
    store = TestBed.inject(NotificationsStore)
    store.connect()
    await settle()
  })

  it('counts the unread notifications as soon as it connects', async () => {
    expect(store.unreadCount()).toBe(3)
  })

  it('keeps the count of the server once a change has come, over a late first count', async () => {
    const late = new Subject<number>()
    api.unreadCount.mockReturnValue(late)
    store.connect()

    changes.next({ unreadCount: 5 })
    late.next(3)

    expect(store.unreadCount()).toBe(5)
  })

  it('loads the first page when it opens, once', async () => {
    store.open()
    await settle()
    store.open()

    expect(api.page).toHaveBeenCalledTimes(1)
    expect(store.status()).toBe('ready')
    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2'])
  })

  it('puts a new notification first and follows the count', async () => {
    store.open()
    await settle()

    changes.next({ unreadCount: 4, notification: notification('n3') })

    expect(store.notifications().map((n) => n.id)).toEqual(['n3', 'n1', 'n2'])
    expect(store.unreadCount()).toBe(4)
    expect(store.total()).toBe(3)
  })

  it('leaves the signals out of the list', async () => {
    store.open()
    await settle()

    changes.next({ unreadCount: 3, notification: notification('s1', 'MODERATION-ACTIVITY-CHANGES') })

    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2'])
  })

  it('loads the next page after the last one, without a notification twice', async () => {
    api.page.mockReturnValueOnce(page([notification('n1'), notification('n2')], true, 'cursor-2', 3))
    store.open()
    await settle()
    api.page.mockReturnValueOnce(page([notification('n2'), notification('n3')], false, 'cursor-3', 3))

    await store.loadMore()

    await settle()

    expect(api.page).toHaveBeenLastCalledWith('cursor-2', 20)
    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2', 'n3'])
    expect(store.hasMore()).toBe(false)
  })

  it('loads the next ones from the start once one is gone, so that none is skipped', async () => {
    api.page.mockReturnValueOnce(page([notification('n1'), notification('n2')], true, 'cursor-2', 3))
    store.open()
    await settle()
    await store.answerInvitation('n1', { resourceId: 'r1', inviteeId: 'me' }, true)
    api.page.mockReturnValueOnce(page([notification('n2'), notification('n3')], false, 'cursor-2', 2))

    await store.loadMore()

    expect(api.page).toHaveBeenLastCalledWith(null, 21)
    expect(store.notifications().map((n) => n.id)).toEqual(['n2', 'n3'])
    expect(store.hasMore()).toBe(false)
  })

  it('marks a notification as read', async () => {
    store.open()
    await settle()

    await store.markAsRead('n1')

    expect(api.markAsRead).toHaveBeenCalledWith('n1')
    expect(store.notifications()[0].readAt).toBeInstanceOf(Date)
    expect(store.unreadCount()).toBe(2)
  })

  it('marks every notification as read', async () => {
    store.open()
    await settle()

    await store.markAllAsRead()

    expect(api.markAllAsRead).toHaveBeenCalled()
    expect(store.notifications().every((n) => n.readAt)).toBe(true)
    expect(store.unreadCount()).toBe(0)
  })

  it('deletes everything only once the person confirms, naming how many', async () => {
    api.page.mockReturnValueOnce(page([notification('n1')], true, 'cursor-1', 12))
    store.open()
    await settle()
    messages.confirm.mockResolvedValueOnce(false)

    await store.deleteAll()

    expect(messages.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Supprimer vos 12 notifications\u00a0?',
        content: 'Cette suppression est définitive.',
        danger: true,
      })
    )
    expect(api.deleteAll).not.toHaveBeenCalled()

    messages.confirm.mockResolvedValueOnce(true)
    await store.deleteAll()

    expect(api.deleteAll).toHaveBeenCalled()
    expect(store.notifications()).toEqual([])
    expect(store.total()).toBe(0)
    expect(store.unreadCount()).toBe(0)
  })

  it('fails into an error, then loads again when it opens', async () => {
    api.page.mockReturnValueOnce(throwError(() => new Error('down')))
    store.open()
    await settle()

    expect(store.status()).toBe('error')

    store.open()

    await settle()

    expect(store.status()).toBe('ready')
  })

  it('loads again on retry while a load hangs, and drops the late answer', async () => {
    const hanging = new Subject<NotificationPage>()
    api.page.mockReturnValueOnce(hanging)
    store.open()
    await settle()

    store.retry()
    await settle()

    expect(store.attempt()).toBe(1)
    expect(store.status()).toBe('ready')
    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2'])

    hanging.next({ notifications: [notification('late')], hasMore: true, cursor: 'late', total: 9 })
    await settle()

    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2'])
    expect(store.total()).toBe(2)
  })

  it('answers an invitation, then lets its notification go', async () => {
    store.open()
    await settle()

    await expect(store.answerInvitation('n1', { resourceId: 'r1', inviteeId: 'me' }, true)).resolves.toBe(true)

    expect(api.answerInvitation).toHaveBeenCalledWith('r1', 'me', true)
    expect(api.delete).toHaveBeenCalledWith('n1')
    expect(store.notifications().map((n) => n.id)).toEqual(['n2'])
  })

  it('says so when an invitation cannot be answered', async () => {
    store.open()
    await settle()
    api.answerInvitation.mockReturnValueOnce(throwError(() => new Error('gone')))

    await expect(store.answerInvitation('n1', { resourceId: 'r1', inviteeId: 'me' }, false)).resolves.toBe(false)

    expect(messages.error).toHaveBeenCalledWith(expect.stringContaining('invitation'))
    expect(store.notifications().map((n) => n.id)).toEqual(['n1', 'n2'])
  })
})
