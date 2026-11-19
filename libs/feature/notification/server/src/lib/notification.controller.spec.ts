import { MessageEvent } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { IRequest } from '@platon/core/server'
import { createUserEntity } from '@platon/core/testing/server'
import { NotificationChange } from '@platon/feature/notification/common'
import { sign } from 'jsonwebtoken'
import { Subject } from 'rxjs'
import { NotificationController } from './notification.controller'
import { NotificationFiltersDTO } from './notification.dto'
import { NotificationEntity } from './notification.entity'
import { NotificationService } from './notification.service'

const at = new Date('2026-10-09T12:00:00.000Z')

const notification = (id: string, data: Record<string, unknown> = { type: 'COURSE-MEMBER-CREATION' }) =>
  ({ id, userId: 'user-1', createdAt: at, updatedAt: at, readAt: null, data } as NotificationEntity)

describe('NotificationController', () => {
  let controller: NotificationController
  let service: jest.Mocked<
    Pick<
      NotificationService,
      'ofUser' | 'unreadCount' | 'changesOf' | 'markAsRead' | 'markAllAsRead' | 'delete' | 'deleteAll' | 'withExtraData'
    >
  >
  const user = createUserEntity({ id: 'user-1' })
  const req = {
    user,
    headers: { authorization: `Bearer ${sign({ sub: 'user-1' }, 'secret', { expiresIn: 900 })}` },
  } as unknown as IRequest

  beforeEach(async () => {
    service = {
      ofUser: jest.fn(),
      unreadCount: jest.fn(),
      changesOf: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      deleteAll: jest.fn(),
      withExtraData: jest.fn().mockResolvedValue(undefined),
    }
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: service }],
    }).compile()
    controller = module.get(NotificationController)
  })

  it('lists the notifications of the person with their extra data, and their total', async () => {
    const invitation = notification('n1', { type: 'RESOURCE-INVITATION', resourceId: 'r1' })
    service.ofUser.mockResolvedValue([[invitation, notification('n2')], 7])
    service.withExtraData.mockImplementation(async (item) => (item.id === 'n1' ? { pending: true } : undefined))
    const filters = { excludeSignals: true, offset: 20, limit: 20 } as NotificationFiltersDTO

    const response = await controller.list(req, filters)

    expect(service.ofUser).toHaveBeenCalledWith('user-1', filters)
    expect(response.total).toBe(7)
    expect(response.resources.map((item) => item.data)).toEqual([
      { type: 'RESOURCE-INVITATION', resourceId: 'r1', pending: true },
      { type: 'COURSE-MEMBER-CREATION' },
    ])
    expect(response.resources[0]).toEqual(
      expect.objectContaining({ id: 'n1', userId: 'user-1', createdAt: at, readAt: null })
    )
  })

  it('keeps to 50 notifications when the request does not say how many', async () => {
    service.ofUser.mockResolvedValue([[], 0])

    await controller.list(req, { excludeSignals: true } as NotificationFiltersDTO)

    expect(service.ofUser).toHaveBeenCalledWith('user-1', { excludeSignals: true, limit: 50 })
  })

  it('gives the unread count of the person', async () => {
    service.unreadCount.mockResolvedValue(4)

    const response = await controller.unreadCount(req)

    expect(service.unreadCount).toHaveBeenCalledWith('user-1')
    expect(response.resource).toBe(4)
  })

  it('marks one, and all, as read for the person', async () => {
    await controller.markAsRead(req, 'n1')
    await controller.markAllAsRead(req)

    expect(service.markAsRead).toHaveBeenCalledWith('user-1', ['n1'])
    expect(service.markAllAsRead).toHaveBeenCalledWith('user-1')
  })

  it('deletes one notification, and all, for the person', async () => {
    await controller.delete(req, 'n1')
    await controller.deleteAll(req)

    expect(service.delete).toHaveBeenCalledWith('user-1', ['n1'])
    expect(service.deleteAll).toHaveBeenCalledWith('user-1')
  })

  it('streams the changes of the person, the notification with its extra data', async () => {
    const changes = new Subject<NotificationChange<Record<string, unknown>>>()
    service.changesOf.mockReturnValue(changes as never)
    service.withExtraData.mockResolvedValue({ pending: true })
    const messages: MessageEvent[] = []

    const subscription = controller.stream(req).subscribe((message) => messages.push(message))
    changes.next({ unreadCount: 2 })
    changes.next({ unreadCount: 3, notification: notification('n3', { type: 'RESOURCE-INVITATION' }) })
    await new Promise<void>((resolve) => setImmediate(resolve))
    subscription.unsubscribe()

    expect(service.changesOf).toHaveBeenCalledWith('user-1')
    expect(messages.filter((message) => message.data)).toEqual([
      { data: { unreadCount: 2 } },
      {
        data: {
          unreadCount: 3,
          notification: expect.objectContaining({ id: 'n3', data: { type: 'RESOURCE-INVITATION', pending: true } }),
        },
      },
    ])
    expect(changes.observed).toBe(false)
  })
})
