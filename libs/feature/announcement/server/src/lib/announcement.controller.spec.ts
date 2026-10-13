import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'
import { AnnouncementFiltersDTO } from './announcement.dto'
import { IRequest } from '@platon/core/server'
import { UserRoles } from '@platon/core/common'
import { createAnnouncementEntity } from './factories/announcement.factory'
import { createUserEntity } from '@platon/core/testing/server'

describe('AnnouncementController', () => {
  let controller: AnnouncementController
  let service: jest.Mocked<AnnouncementService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [
        {
          provide: AnnouncementService,
          useValue: {
            search: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findByIdForUser: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getVisibleForUser: jest.fn(),
            markAsRead: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(AnnouncementController)
    service = module.get(AnnouncementService)
  })

  describe('search', () => {
    it('should return a list of announcements', async () => {
      const announcement = createAnnouncementEntity()
      service.search.mockResolvedValue([[announcement], 1])

      const result = await controller.search({} as AnnouncementFiltersDTO)

      expect(service.search).toHaveBeenCalledWith({})
      expect(result.total).toBe(1)
      expect(result.resources).toHaveLength(1)
    })
  })

  describe('create', () => {
    it('should create and return an announcement with the request user as publisher', async () => {
      const user = createUserEntity()
      const req = { user } as unknown as IRequest
      const announcement = createAnnouncementEntity()
      service.create.mockResolvedValue(announcement)

      const result = await controller.create(req, {
        title: 'Test',
        description: 'Desc',
        active: true,
      })

      // Le controller injecte req.user comme publisher
      expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ publisher: user }))
      expect(result.resource).toBeDefined()
    })
  })

  describe('getVisibleForUser', () => {
    it('should return visible announcements for authenticated user', async () => {
      const user = createUserEntity({ role: UserRoles.student })
      const req = { user } as unknown as IRequest
      const announcement = createAnnouncementEntity()
      service.getVisibleForUser.mockResolvedValue([[announcement], 1])

      const result = await controller.getVisibleForUser(req, {} as AnnouncementFiltersDTO)

      expect(service.getVisibleForUser).toHaveBeenCalledWith(user.id, UserRoles.student, {})
      expect(result.total).toBe(1)
      expect(result.resources).toHaveLength(1)
    })

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const req = { user: null } as unknown as IRequest

      await expect(controller.getVisibleForUser(req, {} as AnnouncementFiltersDTO)).rejects.toBeInstanceOf(
        UnauthorizedException
      )
    })
  })

  describe('findVisibleById', () => {
    it('should return full announcement detail for authenticated user', async () => {
      const user = createUserEntity({ role: UserRoles.teacher })
      const req = { user } as unknown as IRequest
      const announcement = createAnnouncementEntity()
      service.findByIdForUser.mockResolvedValue(announcement)

      const result = await controller.findVisibleById(req, 'announcement-test-id')

      expect(service.findByIdForUser).toHaveBeenCalledWith('announcement-test-id', UserRoles.teacher)
      expect(result.resource).toBeDefined()
    })

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const req = { user: null } as unknown as IRequest

      await expect(controller.findVisibleById(req, 'announcement-test-id')).rejects.toBeInstanceOf(
        UnauthorizedException
      )
    })
  })

  describe('markAsRead', () => {
    it('marks the announcement read for the person who asks', async () => {
      const user = createUserEntity({ role: UserRoles.student })

      await controller.markAsRead({ user } as unknown as IRequest, 'announcement-test-id')

      expect(service.markAsRead).toHaveBeenCalledWith('announcement-test-id', user.id, UserRoles.student)
    })
  })

  describe('findById', () => {
    it('should return the announcement by id', async () => {
      const announcement = createAnnouncementEntity()
      service.findById.mockResolvedValue(announcement)

      const result = await controller.findById('announcement-test-id')

      expect(service.findById).toHaveBeenCalledWith('announcement-test-id')
      expect(result.resource).toBeDefined()
    })
  })

  describe('update', () => {
    it('should update and return the announcement', async () => {
      const updated = createAnnouncementEntity({ title: 'Updated' })
      service.update.mockResolvedValue(updated)

      const changes = { title: 'Updated', description: 'Desc', active: true }
      const result = await controller.update('announcement-test-id', changes)

      expect(service.update).toHaveBeenCalledWith('announcement-test-id', changes)
      expect(result.resource).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete the announcement', async () => {
      service.delete.mockResolvedValue(undefined)

      await expect(controller.delete('announcement-test-id')).resolves.toBeUndefined()
      expect(service.delete).toHaveBeenCalledWith('announcement-test-id')
    })
  })
})
