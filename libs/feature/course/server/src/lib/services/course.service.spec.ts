import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestResponse, NotFoundResponse } from '@platon/core/common'
import { MockRepository, mockRepository, mockSelectQueryBuilder } from '@platon/core/testing/server'
import { CourseOrderings } from '@platon/feature/course/common'
import { DataSource, SelectQueryBuilder } from 'typeorm'
import { CourseEntity } from '../entites/course.entity'
import { CourseSectionEntity } from '../section/section.entity'
import { ActivityEntity } from '../activity/activity.entity'
import { CourseService } from './course.service'

describe('CourseService', () => {
  let service: CourseService
  let repository: MockRepository<CourseEntity>
  let dataSource: { transaction: jest.Mock }

  beforeEach(async () => {
    repository = mockRepository<CourseEntity>()
    dataSource = { transaction: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(CourseEntity), useValue: repository },
      ],
    }).compile()

    service = module.get(CourseService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    let qb: jest.Mocked<SelectQueryBuilder<CourseEntity>>

    beforeEach(() => {
      qb = mockSelectQueryBuilder<CourseEntity>()
      qb.getManyAndCount.mockResolvedValue([[], 0])
      repository.createQueryBuilder.mockReturnValue(qb)
    })

    it('devrait filtrer par is_test (false par défaut)', async () => {
      await service.search()

      expect(qb.andWhere).toHaveBeenCalledWith('course.is_test = :isTest', { isTest: false })
    })

    it('devrait filtrer par recherche textuelle', async () => {
      await service.search({ search: '  algo  ' })

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('f_unaccent'), { search: '%algo%' })
    })

    it('devrait filtrer les cours archivés (au moins un membre archivé)', async () => {
      await service.search({ archived: true, members: ['u1'] })

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('EXISTS'), { archivedMemberIds: ['u1'] })
    })

    it('devrait filtrer les cours non archivés (aucun membre archivé)', async () => {
      await service.search({ archived: false, members: ['u1'] })

      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('NOT EXISTS'), { archivedMemberIds: ['u1'] })
    })

    it('devrait filtrer par période (updated_at >= now - period jours)', async () => {
      await service.search({ period: 7 })

      expect(qb.andWhere).toHaveBeenCalledWith('course.updated_at >= :date', { date: expect.any(Date) })
    })

    it('devrait trier par nom ascendant par défaut (COURSE_ORDERING_DIRECTIONS.NAME)', async () => {
      await service.search({ order: CourseOrderings.NAME })

      expect(qb.orderBy).toHaveBeenCalledWith('course.name', 'ASC')
    })

    it('devrait trier par date de mise à jour descendante par défaut sans filtre', async () => {
      await service.search()

      expect(qb.orderBy).toHaveBeenCalledWith('course.updatedAt', 'DESC')
    })

    it('devrait respecter une direction explicite même pour un champ dont le défaut diffère', async () => {
      await service.search({ order: CourseOrderings.NAME, direction: 'DESC' as never })

      expect(qb.orderBy).toHaveBeenCalledWith('course.name', 'DESC')
    })
  })

  describe('findById', () => {
    it('devrait retourner Optional.empty() si non trouvé', async () => {
      const qb = mockSelectQueryBuilder<CourseEntity>()
      qb.getOne.mockResolvedValue(null)
      repository.createQueryBuilder.mockReturnValue(qb)

      const result = await service.findById('course-1')

      expect(result.isEmpty()).toBe(true)
    })
  })

  describe('create', () => {
    it('devrait créer le cours et une première section dans une transaction', async () => {
      const manager = { save: jest.fn() }
      const course = { id: 'course-1' } as CourseEntity
      manager.save.mockResolvedValueOnce(course).mockResolvedValueOnce(undefined)
      dataSource.transaction.mockImplementation((fn) => fn(manager))

      const result = await service.create({ name: 'My course' })

      expect(manager.save).toHaveBeenCalledWith(CourseEntity, { name: 'My course' })
      expect(manager.save).toHaveBeenCalledWith(
        CourseSectionEntity,
        expect.objectContaining({ courseId: 'course-1', name: 'Section 1', order: 0 })
      )
      expect(result).toBe(course)
    })
  })

  describe('update', () => {
    it("devrait lever une NotFoundResponse si le cours n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.update('course-1', { name: 'New name' })).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait appeler le guard avant la sauvegarde', async () => {
      const course = { id: 'course-1', name: 'Old' } as CourseEntity
      repository.findOne.mockResolvedValue(course)
      repository.save.mockImplementation(async (c) => c as CourseEntity)
      const guard = jest.fn()

      await service.update('course-1', { name: 'New' }, guard)

      expect(guard).toHaveBeenCalledWith(course)
    })

    it('devrait fusionner les changements et sauvegarder', async () => {
      const course = { id: 'course-1', name: 'Old' } as CourseEntity
      repository.findOne.mockResolvedValue(course)
      repository.save.mockImplementation(async (c) => c as CourseEntity)

      const result = await service.update('course-1', { name: 'New' })

      expect(result.name).toBe('New')
    })
  })

  describe('delete', () => {
    it("devrait lever une NotFoundResponse si le cours n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.delete('course-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait appeler le guard puis supprimer le cours', async () => {
      const course = { id: 'course-1' } as CourseEntity
      repository.findOne.mockResolvedValue(course)
      const guard = jest.fn()

      await service.delete('course-1', guard)

      expect(guard).toHaveBeenCalledWith(course)
      expect(repository.remove).toHaveBeenCalledWith(course)
    })
  })

  describe('duplicate', () => {
    it('devrait rejeter si source et cible sont identiques', async () => {
      await expect(service.duplicate('course-1', 'course-1')).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it('devrait lever une NotFoundResponse si le cours source est introuvable', async () => {
      repository.findOne.mockResolvedValueOnce(null)

      await expect(service.duplicate('source', 'target')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait lever une NotFoundResponse si le cours cible est introuvable', async () => {
      repository.findOne.mockResolvedValueOnce({ id: 'source' } as CourseEntity).mockResolvedValueOnce(null)

      await expect(service.duplicate('source', 'target')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait appeler les guards source et cible avant la duplication', async () => {
      repository.findOne
        .mockResolvedValueOnce({ id: 'source' } as CourseEntity)
        .mockResolvedValueOnce({ id: 'target' } as CourseEntity)
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        save: jest.fn(),
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'target' } as CourseEntity),
      }
      dataSource.transaction.mockImplementation((fn) => fn(manager))
      const sourceGuard = jest.fn()
      const targetGuard = jest.fn()

      await service.duplicate('source', 'target', { sourceGuard, targetGuard })

      expect(sourceGuard).toHaveBeenCalledWith({ id: 'source' })
      expect(targetGuard).toHaveBeenCalledWith({ id: 'target' })
    })

    it('devrait dupliquer les sections et activités avec un ordre décalé', async () => {
      repository.findOne
        .mockResolvedValueOnce({ id: 'source' } as CourseEntity)
        .mockResolvedValueOnce({ id: 'target' } as CourseEntity)

      const sourceSection = { id: 'section-1', name: 'Section A', order: 0 } as CourseSectionEntity
      const sourceActivity = {
        id: 'activity-1',
        sectionId: 'section-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        openAt: null,
        closeAt: null,
      } as unknown as ActivityEntity

      const manager = {
        find: jest.fn((entity) => {
          if (entity === CourseSectionEntity) return Promise.resolve([sourceSection])
          if (entity === ActivityEntity) return Promise.resolve([sourceActivity])
          return Promise.resolve([])
        }),
        count: jest.fn().mockResolvedValue(2),
        save: jest.fn((entity, data) =>
          Promise.resolve(entity === CourseSectionEntity ? { ...data, id: 'new-section' } : data)
        ),
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'target' } as CourseEntity),
      }
      dataSource.transaction.mockImplementation((fn) => fn(manager))

      await service.duplicate('source', 'target')

      expect(manager.save).toHaveBeenCalledWith(
        CourseSectionEntity,
        expect.objectContaining({ courseId: 'target', name: 'Section A', order: 2 })
      )
      expect(manager.save).toHaveBeenCalledWith(
        ActivityEntity,
        expect.objectContaining({ courseId: 'target', sectionId: 'new-section' })
      )
    })

    it('devrait avancer une date passée à la même année dans le futur (+1 an)', async () => {
      repository.findOne
        .mockResolvedValueOnce({ id: 'source' } as CourseEntity)
        .mockResolvedValueOnce({ id: 'target' } as CourseEntity)

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const sourceSection = { id: 'section-1', name: 'Section A', order: 0 } as CourseSectionEntity
      const sourceActivity = {
        id: 'activity-1',
        sectionId: 'section-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        openAt: pastDate,
        closeAt: null,
      } as unknown as ActivityEntity

      let savedActivity: Partial<ActivityEntity> | undefined
      const manager = {
        find: jest.fn((entity) => {
          if (entity === CourseSectionEntity) return Promise.resolve([sourceSection])
          if (entity === ActivityEntity) return Promise.resolve([sourceActivity])
          return Promise.resolve([])
        }),
        count: jest.fn().mockResolvedValue(0),
        save: jest.fn((entity, data) => {
          if (entity === ActivityEntity) savedActivity = data
          return Promise.resolve(entity === CourseSectionEntity ? { ...data, id: 'new-section' } : data)
        }),
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'target' } as CourseEntity),
      }
      dataSource.transaction.mockImplementation((fn) => fn(manager))

      await service.duplicate('source', 'target')

      expect(savedActivity?.openAt).toBeInstanceOf(Date)
      expect((savedActivity?.openAt as Date).getTime()).toBeGreaterThan(pastDate.getTime())
    })

    it('devrait retourner null pour une date invalide/absente', async () => {
      repository.findOne
        .mockResolvedValueOnce({ id: 'source' } as CourseEntity)
        .mockResolvedValueOnce({ id: 'target' } as CourseEntity)

      const sourceSection = { id: 'section-1', name: 'Section A', order: 0 } as CourseSectionEntity
      const sourceActivity = {
        id: 'activity-1',
        sectionId: 'section-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        openAt: undefined,
        closeAt: undefined,
      } as unknown as ActivityEntity

      let savedActivity: Partial<ActivityEntity> | undefined
      const manager = {
        find: jest.fn((entity) => {
          if (entity === CourseSectionEntity) return Promise.resolve([sourceSection])
          if (entity === ActivityEntity) return Promise.resolve([sourceActivity])
          return Promise.resolve([])
        }),
        count: jest.fn().mockResolvedValue(0),
        save: jest.fn((entity, data) => {
          if (entity === ActivityEntity) savedActivity = data
          return Promise.resolve(entity === CourseSectionEntity ? { ...data, id: 'new-section' } : data)
        }),
        findOneOrFail: jest.fn().mockResolvedValue({ id: 'target' } as CourseEntity),
      }
      dataSource.transaction.mockImplementation((fn) => fn(manager))

      await service.duplicate('source', 'target')

      expect(savedActivity?.openAt).toBeNull()
      expect(savedActivity?.closeAt).toBeNull()
    })
  })
})
