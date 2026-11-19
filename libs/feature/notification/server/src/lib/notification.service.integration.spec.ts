import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { UserRoles } from '@platon/core/common'
import { PubSubService, UserEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { DataSource, Repository } from 'typeorm'
import { NotificationEntity } from './notification.entity'
import { NotificationService } from './notification.service'

/**
 * Contrairement à notification.service.spec.ts (repository/query builder mockés), ce fichier fait
 * tourner NotificationService contre un vrai Postgres (Testcontainers) pour exercer :
 * - la cascade DB réelle (onDelete: 'CASCADE' sur NotificationEntity.user), invisible à un mock
 *   de repository qui ne supprime jamais réellement de lignes liées ;
 * - deleteWhere() avec une vraie expression de query builder chaînée (buildDeleteQuery), plutôt
 *   qu'un mock de delete()/from()/where() qui ne vérifie jamais que le SQL généré est valide ;
 * - ofUser() avec un vrai tri/pagination/filtre sur une vraie table.
 */
describe('NotificationService (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let userRepo: Repository<UserEntity>
  let notificationRepo: Repository<NotificationEntity>
  let service: NotificationService

  const discovery = { providersWithMetaAtKey: jest.fn().mockResolvedValue([]) } as unknown as DiscoveryService

  beforeAll(async () => {
    testDb = await createTestDatabase([UserEntity, NotificationEntity])
    dataSource = testDb.dataSource
    userRepo = dataSource.getRepository(UserEntity)
    notificationRepo = dataSource.getRepository(NotificationEntity)
  }, 60_000)

  beforeEach(() => {
    // Le pubsub ne fait pas partie de ce qu'on veut valider ici (DB réelle) ; PubSub réel exige
    // Redis, donc on garde un simple stub côté publish comme dans les specs unitaires.
    // A fresh service per test: the signals one test declares do not leak into the next.
    const pubSubService = { publish: jest.fn().mockResolvedValue(undefined) } as unknown as PubSubService
    service = new NotificationService(notificationRepo, discovery, pubSubService)
  })

  afterAll(async () => {
    await testDb.teardown()
  })

  afterEach(async () => {
    await dataSource.query('TRUNCATE "Notifications" CASCADE')
    await dataSource.query('TRUNCATE "Users" CASCADE')
  })

  let userCounter = 0
  const seedUser = async (): Promise<UserEntity> => {
    userCounter++
    return userRepo.save(
      userRepo.create({
        username: `notif-integration-user-${userCounter}`,
        firstName: 'Test',
        lastName: 'User',
        email: `notif-integration-user-${userCounter}@test.local`,
        role: UserRoles.student,
        active: true,
        lastActivity: new Date(),
      })
    )
  }

  describe('cascade DB', () => {
    it("devrait supprimer automatiquement les notifications d'un utilisateur supprimé", async () => {
      const user = await seedUser()
      await service.sendToUser(user.id, { type: 'FOO' })

      await userRepo.delete(user.id)

      const remaining = await notificationRepo.find({ where: { userId: user.id } })
      expect(remaining).toHaveLength(0)
    })
  })

  describe('deleteWhere', () => {
    it('devrait supprimer uniquement les notifications correspondant à une expression additionnelle réelle', async () => {
      const user = await seedUser()
      await service.sendToUser(user.id, { type: 'FOO' })
      await service.sendToUser(user.id, { type: 'BAR' })

      const affected = await service.deleteWhere(user.id, (qb) => qb.andWhere(`data->>'type' = :type`, { type: 'FOO' }))

      expect(affected).toBe(1)
      const remaining = await notificationRepo.find({ where: { userId: user.id } })
      expect(remaining).toHaveLength(1)
      expect(remaining[0].data['type']).toBe('BAR')
    })

    it("ne devrait pas supprimer les notifications d'un autre utilisateur", async () => {
      const user1 = await seedUser()
      const user2 = await seedUser()
      await service.sendToUser(user1.id, { type: 'FOO' })
      await service.sendToUser(user2.id, { type: 'FOO' })

      await service.deleteWhere(user1.id)

      expect(await notificationRepo.find({ where: { userId: user1.id } })).toHaveLength(0)
      expect(await notificationRepo.find({ where: { userId: user2.id } })).toHaveLength(1)
    })
  })

  describe('ofUser', () => {
    it('devrait trier par date décroissante, filtrer les non lues et paginer', async () => {
      const user = await seedUser()
      const n1 = await service.sendToUser(user.id, { type: 'FIRST' })
      await new Promise((resolve) => setTimeout(resolve, 5))
      const n2 = await service.sendToUser(user.id, { type: 'SECOND' })
      await notificationRepo.update(n1.id, { readAt: new Date() })

      const [unread] = await service.ofUser(user.id, { unread: true })
      expect(unread.map((n) => n.id)).toEqual([n2.id])

      const [all] = await service.ofUser(user.id)
      expect(all.map((n) => n.id)).toEqual([n2.id, n1.id])

      const [paged] = await service.ofUser(user.id, { offset: 1, limit: 1 })
      expect(paged.map((n) => n.id)).toEqual([n1.id])
    })
  })

  describe('markAsRead / markAllAsRead / unreadCount', () => {
    it('devrait marquer une notification comme lue puis refléter le compteur', async () => {
      const user = await seedUser()
      const n1 = await service.sendToUser(user.id, { type: 'FOO' })
      await service.sendToUser(user.id, { type: 'BAR' })

      expect(await service.unreadCount(user.id)).toBe(2)

      await service.markAsRead(user.id, [n1.id])
      expect(await service.unreadCount(user.id)).toBe(1)

      await service.markAllAsRead(user.id)
      expect(await service.unreadCount(user.id)).toBe(0)
    })

    it('ne devrait pas compter les signaux déclarés, que la liste garde', async () => {
      const user = await seedUser()
      service.declareSignals('SIGNAL')
      await service.sendToUser(user.id, { type: 'FOO' })
      await service.sendToUser(user.id, { label: 'sans type' })
      await new Promise((resolve) => setTimeout(resolve, 5))
      await service.sendToUser(user.id, { type: 'SIGNAL' })

      expect(await service.unreadCount(user.id)).toBe(2)

      const [all, count] = await service.ofUser(user.id)
      expect(all).toHaveLength(3)
      expect(count).toBe(3)

      // The player reads the latest signal as the first notification of the list.
      const [first] = await service.ofUser(user.id, { limit: 1 })
      expect(first.map((n) => n.data['type'])).toEqual(['SIGNAL'])
    })

    it('devrait écarter les signaux de la liste quand demandé, en gardant pages et total justes', async () => {
      const user = await seedUser()
      service.declareSignals('SIGNAL')
      for (const type of ['FOO', 'SIGNAL', 'BAR']) {
        await service.sendToUser(user.id, { type })
        await new Promise((resolve) => setTimeout(resolve, 5))
      }

      const [page1, total] = await service.ofUser(user.id, { excludeSignals: true, limit: 1 })
      const [page2] = await service.ofUser(user.id, { excludeSignals: true, offset: 1, limit: 1 })

      expect(page1.map((n) => n.data['type'])).toEqual(['BAR'])
      expect(page2.map((n) => n.data['type'])).toEqual(['FOO'])
      expect(total).toBe(2)
    })
  })
})
