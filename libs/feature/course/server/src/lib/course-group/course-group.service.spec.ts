import { NotFoundResponse } from '@platon/core/common'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MockRepository, mockRepository } from '@platon/core/testing/server'
import { CourseGroupMemberService } from '../course-group-member/course-group-member.service'
import { CourseGroupEntity } from './course-group.entity'
import { CourseGroupService } from './course-group.service'

describe('CourseGroupService', () => {
  let service: CourseGroupService
  let repository: MockRepository<CourseGroupEntity>
  let courseGroupMemberService: jest.Mocked<Pick<CourseGroupMemberService, 'isMember'>>

  beforeEach(async () => {
    repository = mockRepository<CourseGroupEntity>()
    courseGroupMemberService = { isMember: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseGroupService,
        { provide: CourseGroupMemberService, useValue: courseGroupMemberService },
        { provide: getRepositoryToken(CourseGroupEntity), useValue: repository },
      ],
    }).compile()

    service = module.get(CourseGroupService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('listCourseGroups', () => {
    it('devrait lister les groupes triés par nom', async () => {
      repository.find.mockResolvedValue([])

      await service.listCourseGroups('course-1')

      expect(repository.find).toHaveBeenCalledWith({ where: { courseId: 'course-1' }, order: { name: 'ASC' } })
    })
  })

  describe('addCourseGroup', () => {
    it('devrait retourner le groupe existant sans le recréer', async () => {
      const existing = { groupId: 'g1', courseId: 'course-1' } as CourseGroupEntity
      repository.findOne.mockResolvedValue(existing)

      const result = await service.addCourseGroup('course-1', 'g1')

      expect(result).toBe(existing)
      expect(repository.save).not.toHaveBeenCalled()
    })

    it('devrait générer un groupId si non fourni', async () => {
      repository.findOne.mockResolvedValue(null)
      repository.count.mockResolvedValue(0)
      repository.create.mockImplementation((data) => data as CourseGroupEntity)
      repository.save.mockImplementation(async (data) => data as CourseGroupEntity)

      const result = await service.addCourseGroup('course-1')

      expect((result as CourseGroupEntity).groupId).toBeDefined()
    })

    it('devrait générer un nom par défaut "Groupe N" si non fourni', async () => {
      repository.findOne.mockResolvedValue(null)
      repository.count.mockResolvedValue(2)
      repository.create.mockImplementation((data) => data as CourseGroupEntity)
      repository.save.mockImplementation(async (data) => data as CourseGroupEntity)

      const result = (await service.addCourseGroup('course-1', 'g1')) as CourseGroupEntity

      expect(result.name).toBe('Groupe 3')
    })

    it('devrait utiliser le nom fourni', async () => {
      repository.findOne.mockResolvedValue(null)
      repository.create.mockImplementation((data) => data as CourseGroupEntity)
      repository.save.mockImplementation(async (data) => data as CourseGroupEntity)

      const result = (await service.addCourseGroup('course-1', 'g1', 'My group')) as CourseGroupEntity

      expect(result.name).toBe('My group')
    })
  })

  describe('update', () => {
    it('says a group missing from the course is not found', async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.update('course-1', 'g1', { name: 'New' })).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('renames the group, and changes nothing else the body carries', async () => {
      const group = { groupId: 'g1', courseId: 'course-1', name: 'Old' } as CourseGroupEntity
      repository.findOne.mockResolvedValue(group)
      repository.save.mockImplementation(async (g) => g as CourseGroupEntity)

      const result = await service.update('course-1', 'g1', { name: 'New', courseId: 'course-2' } as never)

      expect(result).toMatchObject({ name: 'New', courseId: 'course-1', groupId: 'g1' })
    })
  })

  describe('isMember', () => {
    it('has no one in a missing group', async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.isMember('id-1', 'user-1')).resolves.toBe(false)
    })

    it('devrait déléguer au CourseGroupMemberService avec le groupId réel', async () => {
      repository.findOne.mockResolvedValue({ id: 'id-1', groupId: 'g1' } as CourseGroupEntity)
      courseGroupMemberService.isMember.mockResolvedValue(true)

      await expect(service.isMember('id-1', 'user-1')).resolves.toBe(true)
      expect(courseGroupMemberService.isMember).toHaveBeenCalledWith('g1', 'user-1')
    })
  })
})
