import { Test, TestingModule } from '@nestjs/testing'
import { AnnouncementService } from './announcement.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AnnouncementEntity } from './announcement.entity'
import { AnnouncementReadEntity } from './announcement-read.entity'
import { mockRepository, mockSelectQueryBuilder, MockRepository } from '@platon/core/testing/server'
import { createAnnouncementEntity } from './factories/announcement.factory'
import { NotFoundResponse } from '@platon/core/common'
import { UserRoles } from '@platon/core/common'

describe('AnnouncementService', () => {
  let service: AnnouncementService
  let repository: MockRepository<AnnouncementEntity>
  let reads: MockRepository<AnnouncementReadEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        {
          provide: getRepositoryToken(AnnouncementEntity),
          useValue: mockRepository<AnnouncementEntity>(),
        },
        {
          provide: getRepositoryToken(AnnouncementReadEntity),
          useValue: mockRepository<AnnouncementReadEntity>(),
        },
      ],
    }).compile()

    service = module.get<AnnouncementService>(AnnouncementService)
    repository = module.get(getRepositoryToken(AnnouncementEntity))
    reads = module.get(getRepositoryToken(AnnouncementReadEntity))
    reads.find.mockResolvedValue([])
  })

  describe('create', () => {
    it('should create and return the announcement', async () => {
      const announcement = createAnnouncementEntity({ description: 'New Announcement' })
      repository.create.mockReturnValue(announcement)
      repository.save.mockResolvedValue(announcement)

      const result = await service.create({ description: 'New Announcement' })

      expect(repository.create).toHaveBeenCalledWith({ description: 'New Announcement' })
      expect(repository.save).toHaveBeenCalledWith(announcement)
      expect(result).toEqual(announcement)
    })
  })

  describe('findById', () => {
    it('should return the announcement when found', async () => {
      const announcement = createAnnouncementEntity()
      repository.findOne.mockResolvedValue(announcement)

      const result = await service.findById('announcement-test-id')

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'announcement-test-id' },
        relations: ['publisher'],
      })
      expect(result).toEqual(announcement)
    })

    it('should throw NotFoundResponse when not found', async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.findById('non-existent-id')).rejects.toBeInstanceOf(NotFoundResponse)
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        relations: ['publisher'],
      })
    })
  })

  describe('update', () => {
    it('should update and return the announcement', async () => {
      const existing = createAnnouncementEntity({ active: false })
      const changes = { title: 'Updated Title', active: false }
      // update() appelle findById() en interne → on mock findOne
      repository.findOne.mockResolvedValue(existing)
      repository.save.mockResolvedValue({ ...existing, ...changes })

      const result = await service.update('announcement-test-id', changes)

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'announcement-test-id' },
        relations: ['publisher'],
      })
      expect(repository.save).toHaveBeenCalled()
      expect(result.title).toBe('Updated Title')
    })

    it('should throw NotFoundResponse when announcement does not exist', async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.update('non-existent-id', { title: 'x' })).rejects.toBeInstanceOf(NotFoundResponse)
    })
  })

  describe('delete', () => {
    it('should delete the announcement', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] })

      await expect(service.delete('announcement-test-id')).resolves.toBeUndefined()
      expect(repository.delete).toHaveBeenCalledWith('announcement-test-id')
    })

    it('should throw NotFoundException when announcement does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: [] })

      // Le service lance NotFoundException (NestJS) et non NotFoundResponse (platon) pour delete
      await expect(service.delete('non-existent-id')).rejects.toThrow('non trouvée')
    })
  })

  describe('search', () => {
    it('should return all announcements without filters', async () => {
      const announcement = createAnnouncementEntity()
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[announcement], 1])

      const [items, count] = await service.search()

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('announcement')
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('announcement.publisher', 'publisher')
      expect(items).toHaveLength(1)
      expect(count).toBe(1)
    })

    it('should apply search filter when provided', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.search({ search: 'test' })

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%test%' })
      )
    })

    it('should apply active filter when provided', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.search({ active: true })

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('active'),
        expect.objectContaining({ active: true })
      )
    })

    it('should apply pagination when limit and offset are provided', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.search({ limit: 10, offset: 20 })

      expect(qb.limit).toHaveBeenCalledWith(10)
      expect(qb.offset).toHaveBeenCalledWith(20)
    })
  })

  describe('getVisibleForUser', () => {
    it('should return active announcements visible to the user role', async () => {
      const announcement = createAnnouncementEntity()
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[announcement], 1])

      const [items, count] = await service.getVisibleForUser('user-test-id', UserRoles.teacher)

      expect(qb.leftJoin).toHaveBeenCalledWith('announcement.publisher', 'publisher')
      expect(qb.andWhere).toHaveBeenCalledWith('announcement.active = :active', { active: true })
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('targetedRoles'),
        expect.objectContaining({ userRole: UserRoles.teacher })
      )
      expect(items).toHaveLength(1)
      expect(count).toBe(1)
    })

    it('gives each announcement the date the person read it', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([
        [createAnnouncementEntity({ id: 'read-id' }), createAnnouncementEntity({ id: 'unread-id' })],
        2,
      ])
      const readAt = new Date('2026-10-12T08:00:00Z')
      reads.find.mockResolvedValue([{ announcementId: 'read-id', createdAt: readAt } as AnnouncementReadEntity])

      const [items] = await service.getVisibleForUser('user-test-id', UserRoles.student)

      expect(items.map((announcement) => announcement.readAt)).toEqual([readAt, undefined])
    })

    it('should select fields without the data field', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.getVisibleForUser('user-test-id', UserRoles.student)

      const selectedFields: string[] = (qb.select as jest.Mock).mock.calls[0][0]
      expect(selectedFields).not.toContain('announcement.data')
      expect(selectedFields).toContain('announcement.title')
      expect(selectedFields).toContain('announcement.description')
    })

    it('should apply default limit of 20 when no limit is provided', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.getVisibleForUser('user-test-id', UserRoles.student)

      expect(qb.take).toHaveBeenCalledWith(20)
    })

    it('should apply provided limit', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.getVisibleForUser('user-test-id', UserRoles.student, { limit: 5 })

      expect(qb.take).toHaveBeenCalledWith(5)
    })

    it('should apply search filter when provided', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockResolvedValue([[], 0])

      await service.getVisibleForUser('user-test-id', UserRoles.student, { search: 'hello' })

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%hello%' })
      )
    })

    it('should rethrow errors from the query builder', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getManyAndCount.mockRejectedValue(new Error('DB error'))

      await expect(service.getVisibleForUser('user-test-id', UserRoles.teacher)).rejects.toThrow('DB error')
    })
  })

  describe('findByIdForUser', () => {
    it('should return the announcement when active and visible for the user role', async () => {
      const announcement = createAnnouncementEntity()
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getOne.mockResolvedValue(announcement)

      const result = await service.findByIdForUser('announcement-test-id', UserRoles.student)

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('announcement.publisher', 'publisher')
      expect(qb.where).toHaveBeenCalledWith('announcement.id = :id', { id: 'announcement-test-id' })
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('active'),
        expect.objectContaining({ active: true })
      )
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('targetedRoles'),
        expect.objectContaining({ userRole: UserRoles.student })
      )
      expect(result).toEqual(announcement)
    })

    it('should throw NotFoundResponse when announcement does not exist or is not visible', async () => {
      const qb = mockSelectQueryBuilder<AnnouncementEntity>()
      repository.createQueryBuilder.mockReturnValue(qb as any)
      qb.getOne.mockResolvedValue(null)

      await expect(service.findByIdForUser('non-existent-id', UserRoles.student)).rejects.toBeInstanceOf(
        NotFoundResponse
      )
    })
  })
})
