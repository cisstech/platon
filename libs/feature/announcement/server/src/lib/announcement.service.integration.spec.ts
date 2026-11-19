import { NotFoundException } from '@nestjs/common'
import { NotFoundResponse } from '@platon/core/common'
import { UserRoles } from '@platon/core/common'
import { UserEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { DataSource, Repository } from 'typeorm'
import { AnnouncementReadEntity } from './announcement-read.entity'
import { AnnouncementEntity } from './announcement.entity'
import { AnnouncementService } from './announcement.service'

const SOMEONE = '00000000-0000-4000-8000-000000000001'

/**
 * Tests d'intégration : AnnouncementService
 *
 * Ici on utilise
 * un vrai container PostgreSQL (via testcontainers) pour valider que :
 *   - Les requêtes SQL réelles fonctionnent (ILIKE, ANY(), array_length...)
 *   - Les relations TypeORM sont correctement chargées
 *   - Les cas d'erreur base de données sont bien gérés
 *
 * Architecture :
 *   - beforeAll  : démarre le container PostgreSQL (une seule fois pour toute la suite)
 *   - afterEach  : vide les tables pour isoler chaque test
 *   - afterAll   : arrête le container
 */
describe('AnnouncementService (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let announcementRepository: Repository<AnnouncementEntity>
  let readRepository: Repository<AnnouncementReadEntity>
  let userRepository: Repository<UserEntity>
  let service: AnnouncementService

  beforeAll(async () => {
    testDb = await createTestDatabase([UserEntity, AnnouncementEntity, AnnouncementReadEntity])
    dataSource = testDb.dataSource
    announcementRepository = dataSource.getRepository(AnnouncementEntity)
    readRepository = dataSource.getRepository(AnnouncementReadEntity)
    userRepository = dataSource.getRepository(UserEntity)
    service = new AnnouncementService(announcementRepository, readRepository)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE "Announcements" CASCADE')
    await dataSource.query('TRUNCATE TABLE "Users" CASCADE')
  })

  const seedUser = (overrides: Partial<UserEntity> = {}): Promise<UserEntity> => {
    const user = userRepository.create({
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      active: true,
      role: UserRoles.teacher,
      email: 'test@example.com',
      lastActivity: new Date(),
      ...overrides,
    })
    return userRepository.save(user)
  }

  /**
   * Crée une annonce en base via le service et retourne l'entité persistée.
   */
  const seedAnnouncement = (overrides: Partial<AnnouncementEntity> = {}): Promise<AnnouncementEntity> => {
    return service.create({
      title: 'Annonce de test',
      description: 'Description de test',
      active: true,
      ...overrides,
    })
  }

  describe('create', () => {
    it('should persist the announcement and return it with a generated UUID', async () => {
      const result = await service.create({
        title: 'Nouvelle annonce',
        description: "Contenu de l'annonce",
        active: true,
      })

      expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(result.title).toBe('Nouvelle annonce')
      expect(result.active).toBe(true)
      expect(result.createdAt).toBeInstanceOf(Date)
    })

    it('should persist the publisher relation when provided', async () => {
      const user = await seedUser()

      const result = await service.create({
        title: 'Annonce avec publisher',
        description: 'Test',
        active: true,
        publisher: user,
      })

      const persisted = await announcementRepository.findOne({
        where: { id: result.id },
        relations: ['publisher'],
      })
      expect(persisted?.publisher?.id).toBe(user.id)
    })
  })

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return the announcement with publisher relation loaded', async () => {
      const user = await seedUser()
      const created = await seedAnnouncement({ publisher: user })

      const result = await service.findById(created.id)

      expect(result.id).toBe(created.id)
      expect(result.title).toBe('Annonce de test')
      expect(result.publisher).toBeDefined()
      expect(result.publisher?.id).toBe(user.id)
    })

    it('should throw NotFoundResponse when the announcement does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      await expect(service.findById(nonExistentId)).rejects.toBeInstanceOf(NotFoundResponse)
    })
  })

  describe('update', () => {
    it('should update fields and persist the changes in database', async () => {
      const created = await seedAnnouncement({ title: 'Titre original', active: false })

      await service.update(created.id, { title: 'Titre modifié', active: true })

      const persisted = await announcementRepository.findOneBy({ id: created.id })
      expect(persisted?.title).toBe('Titre modifié')
      expect(persisted?.active).toBe(true)
    })

    it('should throw NotFoundResponse when updating a non-existent announcement', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      await expect(service.update(nonExistentId, { title: 'x' })).rejects.toBeInstanceOf(NotFoundResponse)
    })
  })

  describe('delete', () => {
    it('should remove the announcement from the database', async () => {
      const created = await seedAnnouncement()

      await service.delete(created.id)

      const persisted = await announcementRepository.findOneBy({ id: created.id })
      expect(persisted).toBeNull()
    })

    it('should throw NotFoundException when deleting a non-existent announcement', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      await expect(service.delete(nonExistentId)).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  // ─── search ───────────────────────────────────────────────────────────────

  describe('search', () => {
    it('should return all announcements when no filters are provided', async () => {
      await seedAnnouncement({ title: 'Annonce A' })
      await seedAnnouncement({ title: 'Annonce B' })

      const [items, count] = await service.search()

      expect(count).toBe(2)
      expect(items).toHaveLength(2)
    })

    it('should filter by title using ILIKE (case-insensitive)', async () => {
      await seedAnnouncement({ title: 'Bienvenue sur Platon' })
      await seedAnnouncement({ title: 'Maintenance planifiée' })

      // Recherche en minuscules : doit correspondre à "Bienvenue" grâce à ILIKE
      const [items, count] = await service.search({ search: 'bienvenue' })

      expect(count).toBe(1)
      expect(items[0].title).toBe('Bienvenue sur Platon')
    })

    it('should filter by description using ILIKE', async () => {
      await seedAnnouncement({ description: 'Mise à jour importante du système' })
      await seedAnnouncement({ description: 'Rien de spécial' })

      const [items, count] = await service.search({ search: 'MISE À JOUR' })

      expect(count).toBe(1)
      expect(items[0].description).toBe('Mise à jour importante du système')
    })

    it('should filter by active status', async () => {
      await seedAnnouncement({ title: 'Active', active: true })
      await seedAnnouncement({ title: 'Inactive', active: false })

      const [activeItems] = await service.search({ active: true })
      const [inactiveItems] = await service.search({ active: false })

      expect(activeItems.every((a) => a.active)).toBe(true)
      expect(inactiveItems.every((a) => !a.active)).toBe(true)
    })

    it('should respect limit and offset for pagination', async () => {
      await seedAnnouncement({ title: 'Annonce 1' })
      await seedAnnouncement({ title: 'Annonce 2' })
      await seedAnnouncement({ title: 'Annonce 3' })

      const [page1] = await service.search({ limit: 2, offset: 0 })
      const [page2] = await service.search({ limit: 2, offset: 2 })

      expect(page1).toHaveLength(2)
      expect(page2).toHaveLength(1)
    })
  })

  describe('getVisibleForUser', () => {
    it('should return only active announcements', async () => {
      await seedAnnouncement({ title: 'Active', active: true, targetedRoles: undefined })
      await seedAnnouncement({ title: 'Inactive', active: false, targetedRoles: undefined })

      const [items] = await service.getVisibleForUser(SOMEONE, UserRoles.teacher)

      expect(items.every((a) => a.active)).toBe(true)
      expect(items.find((a) => a.title === 'Inactive')).toBeUndefined()
    })

    it('should return announcements with no targetedRoles to any user role (ANY() SQL)', async () => {
      // targetedRoles = null → visible par tous les rôles
      await seedAnnouncement({ title: 'Pour tous', active: true, targetedRoles: undefined })

      const [itemsTeacher] = await service.getVisibleForUser(SOMEONE, UserRoles.teacher)
      const [itemsStudent] = await service.getVisibleForUser(SOMEONE, UserRoles.student)

      expect(itemsTeacher).toHaveLength(1)
      expect(itemsStudent).toHaveLength(1)
    })

    it('should return role-targeted announcements only to matching role (array_length + ANY)', async () => {
      await seedAnnouncement({
        title: 'Pour les profs uniquement',
        active: true,
        targetedRoles: [UserRoles.teacher],
      })

      const [teacherItems] = await service.getVisibleForUser(SOMEONE, UserRoles.teacher)
      const [studentItems] = await service.getVisibleForUser(SOMEONE, UserRoles.student)

      expect(teacherItems).toHaveLength(1)
      // Un student ne doit pas voir cette annonce
      expect(studentItems).toHaveLength(0)
    })

    it('should filter by search term on visible announcements', async () => {
      await seedAnnouncement({ title: 'Nouveauté importante', active: true })
      await seedAnnouncement({ title: 'Maintenance', active: true })

      const [items] = await service.getVisibleForUser(SOMEONE, UserRoles.teacher, { search: 'nouveauté' })

      expect(items).toHaveLength(1)
      expect(items[0].title).toBe('Nouveauté importante')
    })
  })

  describe('reads', () => {
    it('gives each visible announcement the read of the person who asks, never of another', async () => {
      const ines = await seedUser({ username: 'ines', email: 'ines@example.com', role: UserRoles.student })
      const karim = await seedUser({ username: 'karim', email: 'karim@example.com', role: UserRoles.student })
      const readByInes = await seedAnnouncement({ title: 'Read by Ines' })
      const readByKarim = await seedAnnouncement({ title: 'Read by Karim only' })
      await service.markAsRead(readByInes.id, ines.id, UserRoles.student)
      await service.markAsRead(readByKarim.id, karim.id, UserRoles.student)

      const [items] = await service.getVisibleForUser(ines.id, UserRoles.student)

      expect(items.find((a) => a.title === 'Read by Ines')?.readAt).toBeInstanceOf(Date)
      expect(items.find((a) => a.title === 'Read by Karim only')?.readAt).toBeUndefined()
    })

    it('records a read once, however often it is marked', async () => {
      const ines = await seedUser({ username: 'ines', email: 'ines@example.com', role: UserRoles.student })
      const announcement = await seedAnnouncement()

      await service.markAsRead(announcement.id, ines.id, UserRoles.student)
      await service.markAsRead(announcement.id, ines.id, UserRoles.student)

      expect(await readRepository.count({ where: { userId: ines.id } })).toBe(1)
    })

    it('forgets the reads of an announcement deleted, and of a person deleted', async () => {
      const ines = await seedUser({ username: 'ines', email: 'ines@example.com', role: UserRoles.student })
      const karim = await seedUser({ username: 'karim', email: 'karim@example.com', role: UserRoles.student })
      const deleted = await seedAnnouncement({ title: 'Deleted' })
      const kept = await seedAnnouncement({ title: 'Kept' })
      for (const reader of [ines, karim]) {
        await service.markAsRead(deleted.id, reader.id, UserRoles.student)
        await service.markAsRead(kept.id, reader.id, UserRoles.student)
      }

      await service.delete(deleted.id)
      await userRepository.delete(karim.id)

      const left = await readRepository.find()
      expect(left.map(({ userId, announcementId }) => [userId, announcementId])).toEqual([[ines.id, kept.id]])
    })

    it('refuses to mark an announcement that is inactive or meant for another role', async () => {
      const ines = await seedUser({ username: 'ines', email: 'ines@example.com', role: UserRoles.student })
      const inactive = await seedAnnouncement({ active: false })
      const forTeachers = await seedAnnouncement({ targetedRoles: [UserRoles.teacher] })

      await expect(service.markAsRead(inactive.id, ines.id, UserRoles.student)).rejects.toBeInstanceOf(NotFoundResponse)
      await expect(service.markAsRead(forTeachers.id, ines.id, UserRoles.student)).rejects.toBeInstanceOf(
        NotFoundResponse
      )
      expect(await readRepository.count()).toBe(0)
    })
  })
})
