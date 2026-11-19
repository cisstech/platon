import { Test } from '@nestjs/testing'
import { ForbiddenResponse, NotFoundResponse } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { Optional } from 'typescript-optional'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseSectionController } from './section.controller'
import { CourseSectionEntity } from './section.entity'
import { CourseSectionService } from './section.service'

describe('CourseSectionController', () => {
  let controller: CourseSectionController
  let service: jest.Mocked<Pick<CourseSectionService, 'findById' | 'ofCourse' | 'create' | 'update' | 'delete'>>
  let permissions: jest.Mocked<
    Pick<CoursePermissionsService, 'ensureCourseReadPermission' | 'ensureCourseWritePermission'>
  >
  const req = { user: { id: 'user-1' } } as IRequest

  beforeEach(async () => {
    service = {
      findById: jest.fn(),
      ofCourse: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    permissions = {
      ensureCourseReadPermission: jest.fn().mockResolvedValue(undefined),
      ensureCourseWritePermission: jest.fn().mockResolvedValue(undefined),
    }

    const module = await Test.createTestingModule({
      providers: [
        CourseSectionController,
        { provide: CourseSectionService, useValue: service },
        { provide: CoursePermissionsService, useValue: permissions },
      ],
    }).compile()

    controller = module.get(CourseSectionController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('find', () => {
    it("devrait lever une NotFoundResponse si la section n'existe pas", async () => {
      service.findById.mockResolvedValue(Optional.empty())

      await expect(controller.find(req, 'course-1', 'section-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait retourner la section trouvée', async () => {
      service.findById.mockResolvedValue(Optional.of({ id: 'section-1' } as CourseSectionEntity))

      const result = await controller.find(req, 'course-1', 'section-1')

      expect(result.resource.id).toBe('section-1')
    })
  })

  describe('list', () => {
    it('devrait retourner la liste mappée des sections', async () => {
      service.ofCourse.mockResolvedValue([[{ id: 's1' } as CourseSectionEntity], 1])

      const result = await controller.list(req, 'course-1')

      expect(result.total).toBe(1)
    })
  })

  describe('create', () => {
    it('devrait créer la section avec le courseId injecté', async () => {
      service.create.mockResolvedValue({ id: 'section-1' } as CourseSectionEntity)

      await controller.create(req, 'course-1', { name: 'Section', order: 0 } as never)

      expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-1', name: 'Section' }))
    })
  })

  describe('update', () => {
    it('devrait déléguer au service', async () => {
      service.update.mockResolvedValue({ id: 'section-1', name: 'New' } as CourseSectionEntity)

      const result = await controller.update(req, 'course-1', 'section-1', { name: 'New' })

      expect(service.update).toHaveBeenCalledWith('course-1', 'section-1', { name: 'New' })
      expect(result.resource.name).toBe('New')
    })
  })

  describe('delete', () => {
    it('devrait supprimer la section', async () => {
      await controller.delete(req, 'course-1', 'section-1')

      expect(service.delete).toHaveBeenCalledWith('course-1', 'section-1')
    })
  })

  describe('permissions', () => {
    it('lists the sections of a course to a person who may read it, and to no one else', async () => {
      service.ofCourse.mockResolvedValue([[], 0])
      await controller.list(req, 'course-1')
      expect(permissions.ensureCourseReadPermission).toHaveBeenCalledWith('course-1', req)

      permissions.ensureCourseReadPermission.mockRejectedValue(new ForbiddenResponse('No'))
      await expect(controller.list(req, 'course-1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('changes nothing for a person who may not change the course', async () => {
      permissions.ensureCourseWritePermission.mockRejectedValue(new ForbiddenResponse('No'))

      await expect(controller.delete(req, 'course-1', 'section-1')).rejects.toBeInstanceOf(ForbiddenResponse)
      await expect(controller.update(req, 'course-1', 'section-1', { name: 'New' })).rejects.toBeInstanceOf(
        ForbiddenResponse
      )
      expect(service.delete).not.toHaveBeenCalled()
      expect(service.update).not.toHaveBeenCalled()
    })
  })
})
