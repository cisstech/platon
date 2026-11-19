import { Test } from '@nestjs/testing'
import { IRequest, PubSubService } from '@platon/core/server'
import { NotificationEntity } from './notification.entity'
import { NotificationGraphModel } from './notification.graphql'
import { NotificationChangeResolver, NotificationResolver } from './notification.resolver'
import { ON_CHANGE_NOTIFICATIONS } from './notification.pubsub'
import { NotificationService } from './notification.service'

describe('NotificationResolver', () => {
  let resolver: NotificationResolver
  let changeResolver: NotificationChangeResolver
  let notificationService: jest.Mocked<
    Pick<
      NotificationService,
      | 'ofUser'
      | 'markAsRead'
      | 'markAsUnread'
      | 'markAllAsRead'
      | 'delete'
      | 'deleteAll'
      | 'withExtraData'
      | 'unreadCount'
    >
  >
  let pubSubService: jest.Mocked<Pick<PubSubService, 'asyncIterator'>>
  const req = { user: { id: 'user-1' } } as IRequest

  beforeEach(async () => {
    notificationService = {
      ofUser: jest.fn(),
      markAsRead: jest.fn(),
      markAsUnread: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      deleteAll: jest.fn(),
      withExtraData: jest.fn(),
      unreadCount: jest.fn(),
    }
    pubSubService = { asyncIterator: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        NotificationResolver,
        NotificationChangeResolver,
        { provide: NotificationService, useValue: notificationService },
        { provide: PubSubService, useValue: pubSubService },
      ],
    }).compile()

    resolver = module.get(NotificationResolver)
    changeResolver = module.get(NotificationChangeResolver)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('notifications', () => {
    it("devrait retourner une connection relay construite depuis les notifications de l'utilisateur", async () => {
      const items = [
        { id: '1', data: {} } as unknown as NotificationEntity,
        { id: '2', data: {} } as unknown as NotificationEntity,
      ]
      notificationService.ofUser.mockResolvedValue([items, 2])

      const result = await resolver.notifications(req)

      expect(notificationService.ofUser).toHaveBeenCalledWith('user-1', { offset: undefined, limit: undefined })
      expect(result['totalCount']).toBe(2)
      expect(result['edges']).toHaveLength(2)
      expect(result['edges'][0].node).toBeInstanceOf(NotificationGraphModel)
    })

    it('devrait transmettre les filtres et calculer offset/limit depuis first/after', async () => {
      notificationService.ofUser.mockResolvedValue([[], 0])

      await resolver.notifications(req, { unread: true }, 10)

      expect(notificationService.ofUser).toHaveBeenCalledWith('user-1', {
        unread: true,
        offset: 0,
        limit: 10,
      })
    })
  })

  describe('markAsRead', () => {
    it('devrait déléguer au service et retourner true', async () => {
      const result = await resolver.markAsRead(req, 'notif-1')

      expect(notificationService.markAsRead).toHaveBeenCalledWith('user-1', ['notif-1'])
      expect(result).toBe(true)
    })
  })

  describe('markAsUnread', () => {
    it('devrait déléguer au service et retourner true', async () => {
      const result = await resolver.markAsUnread(req, 'notif-1')

      expect(notificationService.markAsUnread).toHaveBeenCalledWith('user-1', ['notif-1'])
      expect(result).toBe(true)
    })
  })

  describe('markAllAsRead', () => {
    it('devrait déléguer au service et retourner true', async () => {
      const result = await resolver.markAllAsRead(req)

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith('user-1')
      expect(result).toBe(true)
    })
  })

  describe('deleteNotification', () => {
    it('devrait retourner true quand une notification a été supprimée', async () => {
      notificationService.delete.mockResolvedValue(1)

      const result = await resolver.deleteNotification(req, 'notif-1')

      expect(notificationService.delete).toHaveBeenCalledWith('user-1', ['notif-1'])
      expect(result).toBe(true)
    })

    it("devrait retourner false quand rien n'a été supprimé", async () => {
      notificationService.delete.mockResolvedValue(0)

      const result = await resolver.deleteNotification(req, 'notif-1')

      expect(result).toBe(false)
    })
  })

  describe('deleteAllNotifications', () => {
    it('devrait retourner true quand des notifications ont été supprimées', async () => {
      notificationService.deleteAll.mockResolvedValue(3)

      const result = await resolver.deleteAllNotifications(req)

      expect(notificationService.deleteAll).toHaveBeenCalledWith('user-1')
      expect(result).toBe(true)
    })

    it("devrait retourner false quand rien n'a été supprimé", async () => {
      notificationService.deleteAll.mockResolvedValue(0)

      const result = await resolver.deleteAllNotifications(req)

      expect(result).toBe(false)
    })
  })

  describe('user', () => {
    it("devrait retourner un UserGraphModel construit depuis l'utilisateur de la requête", async () => {
      const result = await resolver.user(req)

      expect(result.id).toBe('user-1')
    })
  })

  describe('data', () => {
    it('devrait fusionner les données de base avec les données supplémentaires du provider', async () => {
      notificationService.withExtraData.mockResolvedValue({ extra: true })
      const parent = new NotificationGraphModel({ data: { type: 'FOO' } })

      const result = await resolver.data(parent)

      expect(notificationService.withExtraData).toHaveBeenCalledWith(parent)
      expect(result).toEqual({ type: 'FOO', extra: true })
    })

    it('devrait retourner uniquement les données de base si aucune donnée supplémentaire', async () => {
      notificationService.withExtraData.mockResolvedValue(undefined)
      const parent = new NotificationGraphModel({ data: { type: 'FOO' } })

      const result = await resolver.data(parent)

      expect(result).toEqual({ type: 'FOO' })
    })
  })

  describe('onChangeNotifications', () => {
    it("devrait s'abonner au canal filtré par utilisateur", () => {
      const iterator = {} as AsyncIterator<unknown>
      pubSubService.asyncIterator.mockReturnValue(iterator)

      const result = resolver.onChangeNotifications(req)

      expect(pubSubService.asyncIterator).toHaveBeenCalledWith(ON_CHANGE_NOTIFICATIONS, { userId: 'user-1' })
      expect(result).toBe(iterator)
    })
  })

  describe('unreadNotificationCount', () => {
    it('devrait retourner le compteur des notifications non lues de la personne connectée', async () => {
      notificationService.unreadCount.mockResolvedValue(3)

      const result = await resolver.unreadNotificationCount(req)

      expect(notificationService.unreadCount).toHaveBeenCalledWith('user-1')
      expect(result).toBe(3)
    })
  })

  describe('NotificationChangeResolver.unreadCount', () => {
    it('devrait déléguer au service le comptage des notifications non lues', async () => {
      notificationService.unreadCount.mockResolvedValue(7)

      const result = await changeResolver.unreadCount(req)

      expect(notificationService.unreadCount).toHaveBeenCalledWith('user-1')
      expect(result).toBe(7)
    })
  })
})
