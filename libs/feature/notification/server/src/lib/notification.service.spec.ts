import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PubSubService } from '@platon/core/server'
import { MockRepository, mockRepository, mockSelectQueryBuilder } from '@platon/core/testing/server'
import { EntityManager, SelectQueryBuilder } from 'typeorm'
import { NotificationEntity } from './notification.entity'
import { NOTIFICATION_EXTRA_DATA, NotificationExtraDataProvider } from './notification.provider'
import { ON_CHANGE_NOTIFICATIONS } from './notification.pubsub'
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  let service: NotificationService
  let repository: MockRepository<NotificationEntity>
  let discovery: jest.Mocked<Pick<DiscoveryService, 'providersWithMetaAtKey'>>
  let pubSubService: jest.Mocked<Pick<PubSubService, 'publish'>>

  beforeEach(async () => {
    repository = mockRepository<NotificationEntity>()
    discovery = { providersWithMetaAtKey: jest.fn() }
    pubSubService = { publish: jest.fn().mockResolvedValue(undefined) }

    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(NotificationEntity), useValue: repository },
        { provide: DiscoveryService, useValue: discovery },
        { provide: PubSubService, useValue: pubSubService },
      ],
    }).compile()

    service = module.get(NotificationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('init', () => {
    it('devrait enregistrer les providers de données supplémentaires découverts', async () => {
      const instance: NotificationExtraDataProvider = {
        match: jest.fn(),
        provide: jest.fn(),
      }
      discovery.providersWithMetaAtKey.mockResolvedValue([
        { discoveredClass: { name: 'MyProvider', instance } } as never,
      ])

      await service.init()

      expect(discovery.providersWithMetaAtKey).toHaveBeenCalledWith(NOTIFICATION_EXTRA_DATA)

      const notification = { data: { type: 'FOO' } } as unknown as NotificationEntity
      ;(instance.match as jest.Mock).mockReturnValue(true)
      ;(instance.provide as jest.Mock).mockResolvedValue({ extra: true })

      await expect(service.withExtraData(notification)).resolves.toEqual({ extra: true })
    })
  })

  describe('sendToUser', () => {
    it('devrait créer la notification via le repository et publier le changement', async () => {
      const notification = { id: '1', userId: 'user-1', data: { type: 'FOO' } } as unknown as NotificationEntity
      repository.create.mockReturnValue(notification)
      repository.save.mockResolvedValue(notification)

      const result = await service.sendToUser('user-1', { type: 'FOO' })

      expect(repository.create).toHaveBeenCalledWith({ userId: 'user-1', data: { type: 'FOO' } })
      expect(repository.save).toHaveBeenCalledWith(notification)
      expect(result).toBe(notification)
      expect(pubSubService.publish).toHaveBeenCalledWith(ON_CHANGE_NOTIFICATIONS, {
        userId: 'user-1',
        newNotification: notification,
      })
    })

    it('devrait utiliser un EntityManager fourni au lieu du repository', async () => {
      const notification = { id: '1', userId: 'user-1', data: { type: 'FOO' } } as unknown as NotificationEntity
      const entityManager = {
        create: jest.fn().mockReturnValue(notification),
        save: jest.fn().mockResolvedValue(notification),
      } as unknown as EntityManager

      const result = await service.sendToUser('user-1', { type: 'FOO' }, entityManager)

      expect(entityManager.create).toHaveBeenCalledWith(NotificationEntity, { userId: 'user-1', data: { type: 'FOO' } })
      expect(entityManager.save).toHaveBeenCalledWith(notification)
      expect(repository.save).not.toHaveBeenCalled()
      expect(result).toBe(notification)
    })

    it('ne devrait pas faire échouer la requête si la publication pubsub échoue', async () => {
      const notification = { id: '1', userId: 'user-1', data: { type: 'FOO' } } as unknown as NotificationEntity
      repository.create.mockReturnValue(notification)
      repository.save.mockResolvedValue(notification)
      pubSubService.publish.mockRejectedValue(new Error('boom'))

      await expect(service.sendToUser('user-1', { type: 'FOO' })).resolves.toBe(notification)
    })
  })

  describe('sendToAllUsers', () => {
    it('devrait envoyer une notification à chaque utilisateur', async () => {
      const notification = { id: '1', userId: '', data: { type: 'FOO' } } as unknown as NotificationEntity
      repository.create.mockReturnValue(notification)
      repository.save.mockResolvedValue(notification)

      await service.sendToAllUsers(['user-1', 'user-2'], { type: 'FOO' })

      expect(repository.create).toHaveBeenCalledTimes(2)
      expect(repository.create).toHaveBeenCalledWith({ userId: 'user-1', data: { type: 'FOO' } })
      expect(repository.create).toHaveBeenCalledWith({ userId: 'user-2', data: { type: 'FOO' } })
    })
  })

  describe('ofUser', () => {
    let qb: jest.Mocked<SelectQueryBuilder<NotificationEntity>>

    beforeEach(() => {
      qb = mockSelectQueryBuilder<NotificationEntity>()
      repository.createQueryBuilder.mockReturnValue(qb)
    })

    it('devrait filtrer par utilisateur et trier par date décroissante', async () => {
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.ofUser('user-1')

      expect(qb.where).toHaveBeenCalledWith('user_id = :userId', { userId: 'user-1' })
      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'DESC')
      expect(qb.andWhere).not.toHaveBeenCalled()
      expect(qb.offset).not.toHaveBeenCalled()
      expect(qb.limit).not.toHaveBeenCalled()
    })

    it('devrait filtrer les notifications non lues quand demandé', async () => {
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.ofUser('user-1', { unread: true })

      expect(qb.andWhere).toHaveBeenCalledWith('read_at IS NULL')
    })

    it('devrait écarter les signaux déclarés quand demandé', async () => {
      service.declareSignals('SIGNAL')

      await service.ofUser('user-1', { excludeSignals: true })

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('NOT IN (:...signals)'), {
        signals: ['SIGNAL'],
      })
    })

    it('devrait appliquer offset et limit quand fournis', async () => {
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.ofUser('user-1', { offset: 10, limit: 5 })

      expect(qb.offset).toHaveBeenCalledWith(10)
      expect(qb.limit).toHaveBeenCalledWith(5)
    })
  })

  describe('markAsRead', () => {
    it('devrait mettre à jour readAt et notifier', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as never)

      await service.markAsRead('user-1', ['id-1', 'id-2'])

      expect(repository.update).toHaveBeenCalledWith(
        { userId: 'user-1', id: expect.anything() },
        { readAt: expect.any(Date) }
      )
      expect(pubSubService.publish).toHaveBeenCalledWith(ON_CHANGE_NOTIFICATIONS, { userId: 'user-1' })
    })
  })

  describe('markAsUnread', () => {
    it('devrait remettre readAt à null et notifier', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as never)

      await service.markAsUnread('user-1', ['id-1'])

      expect(repository.update).toHaveBeenCalledWith({ userId: 'user-1', id: expect.anything() }, { readAt: null })
      expect(pubSubService.publish).toHaveBeenCalled()
    })
  })

  describe('markAllAsRead', () => {
    it("devrait marquer toutes les notifications non lues de l'utilisateur comme lues", async () => {
      repository.update.mockResolvedValue({ affected: 3 } as never)

      await service.markAllAsRead('user-1')

      expect(repository.update).toHaveBeenCalledWith(
        { userId: 'user-1', readAt: expect.anything() },
        { readAt: expect.any(Date) }
      )
      expect(pubSubService.publish).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('devrait supprimer les notifications et notifier si des lignes ont été affectées', async () => {
      repository.delete.mockResolvedValue({ affected: 2 } as never)

      const result = await service.delete('user-1', ['id-1', 'id-2'])

      expect(repository.delete).toHaveBeenCalledWith(['id-1', 'id-2'])
      expect(result).toBe(2)
      expect(pubSubService.publish).toHaveBeenCalled()
    })

    it('ne devrait pas notifier si aucune ligne affectée', async () => {
      repository.delete.mockResolvedValue({ affected: 0 } as never)

      const result = await service.delete('user-1', ['id-1'])

      expect(result).toBe(0)
      expect(pubSubService.publish).not.toHaveBeenCalled()
    })
  })

  describe('deleteAll', () => {
    it("devrait supprimer toutes les notifications de l'utilisateur et notifier", async () => {
      repository.delete.mockResolvedValue({ affected: 5 } as never)

      const result = await service.deleteAll('user-1')

      expect(repository.delete).toHaveBeenCalledWith({ userId: 'user-1' })
      expect(result).toBe(5)
      expect(pubSubService.publish).toHaveBeenCalled()
    })

    it('ne devrait pas notifier si aucune ligne affectée', async () => {
      repository.delete.mockResolvedValue({ affected: 0 } as never)

      const result = await service.deleteAll('user-1')

      expect(result).toBe(0)
      expect(pubSubService.publish).not.toHaveBeenCalled()
    })
  })

  describe('deleteWhere', () => {
    it('devrait construire une requête de suppression filtrée par utilisateur et appliquer les expressions', async () => {
      const execute = jest.fn().mockResolvedValue({ affected: 1 })
      const deleteQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute,
      }
      const fromQb = { from: jest.fn().mockReturnValue(deleteQb) }
      const qb = {
        delete: jest.fn().mockReturnValue(fromQb),
      }
      repository.createQueryBuilder.mockReturnValue(qb as never)

      const extraExpression = jest.fn((builder) => builder.andWhere('type = :type', { type: 'FOO' }))

      const result = await service.deleteWhere('user-1', extraExpression as never)

      expect(qb.delete).toHaveBeenCalled()
      expect(fromQb.from).toHaveBeenCalledWith(NotificationEntity)
      expect(deleteQb.where).toHaveBeenCalledWith('user_id = :userId', { userId: 'user-1' })
      expect(extraExpression).toHaveBeenCalledWith(deleteQb)
      expect(result).toBe(1)
      expect(pubSubService.publish).toHaveBeenCalled()
    })

    it('ne devrait pas notifier si aucune ligne affectée', async () => {
      const execute = jest.fn().mockResolvedValue({ affected: 0 })
      const deleteQb = { where: jest.fn().mockReturnThis(), execute }
      const fromQb = { from: jest.fn().mockReturnValue(deleteQb) }
      const qb = { delete: jest.fn().mockReturnValue(fromQb) }
      repository.createQueryBuilder.mockReturnValue(qb as never)

      const result = await service.deleteWhere('user-1')

      expect(result).toBe(0)
      expect(pubSubService.publish).not.toHaveBeenCalled()
    })
  })

  describe('unreadCount', () => {
    let qb: jest.Mocked<SelectQueryBuilder<NotificationEntity>>

    beforeEach(() => {
      qb = mockSelectQueryBuilder<NotificationEntity>()
      repository.createQueryBuilder.mockReturnValue(qb)
    })

    it("devrait compter les notifications non lues de l'utilisateur", async () => {
      qb.getCount.mockResolvedValue(4)

      const result = await service.unreadCount('user-1')

      expect(qb.where).toHaveBeenCalledWith('user_id = :userId', { userId: 'user-1' })
      expect(qb.andWhere).toHaveBeenCalledWith('read_at IS NULL')
      expect(result).toBe(4)
    })

    it('devrait écarter les types déclarés comme signaux', async () => {
      qb.getCount.mockResolvedValue(1)
      service.declareSignals('SIGNAL-A', 'SIGNAL-B')

      await service.unreadCount('user-1')

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('NOT IN (:...signals)'), {
        signals: ['SIGNAL-A', 'SIGNAL-B'],
      })
    })
  })

  describe('withExtraData', () => {
    it('devrait retourner undefined si aucun provider ne correspond', async () => {
      const notification = { data: { type: 'FOO' } } as unknown as NotificationEntity

      await expect(service.withExtraData(notification)).resolves.toBeUndefined()
    })
  })
})
