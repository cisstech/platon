import { Test } from '@nestjs/testing'
import { ForbiddenResponse } from '@platon/core/common'
import { AuthService, IRequest } from '@platon/core/server'
import { CourseMemberRoles } from '@platon/feature/course/common'
import { Optional } from 'typescript-optional'
import { CourseMemberController } from './course-member.controller'
import { CourseMemberEntity } from './course-member.entity'
import { CourseMemberService } from './course-member.service'
import { CoursePermissionsService } from '../permissions/permissions.service'

describe('CourseMemberController', () => {
  let controller: CourseMemberController
  let service: jest.Mocked<
    Pick<
      CourseMemberService,
      | 'search'
      | 'hasWritePermission'
      | 'addGroup'
      | 'addUser'
      | 'findById'
      | 'findByIds'
      | 'delete'
      | 'setArchivedByUser'
      | 'getByUserIdAndCourseId'
      | 'updateRole'
    >
  >
  let authService: jest.Mocked<Pick<AuthService, 'createCandidateAccount'>>
  const req = { user: { id: 'teacher-1' } } as IRequest

  beforeEach(async () => {
    service = {
      search: jest.fn(),
      hasWritePermission: jest.fn(),
      addGroup: jest.fn(),
      addUser: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      delete: jest.fn(),
      setArchivedByUser: jest.fn(),
      getByUserIdAndCourseId: jest.fn(),
      updateRole: jest.fn(),
    }
    authService = { createCandidateAccount: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseMemberController,
        { provide: CourseMemberService, useValue: service },
        { provide: AuthService, useValue: authService },
        { provide: CoursePermissionsService, useValue: { ensureCourseReadPermission: jest.fn() } },
      ],
    }).compile()

    controller = module.get(CourseMemberController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('devrait retourner la liste mappée des membres', async () => {
      service.search.mockResolvedValue([[{ id: 'm1' } as CourseMemberEntity], 1])

      const result = await controller.search(req, 'course-1', {})

      expect(service.search).toHaveBeenCalledWith('course-1', {})
      expect(result.total).toBe(1)
    })
  })

  describe('create', () => {
    it("devrait lever une ForbiddenResponse sans permission d'écriture", async () => {
      service.hasWritePermission.mockResolvedValue(false)

      await expect(
        controller.create(req, 'course-1', { id: 'u1', role: CourseMemberRoles.student })
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait ajouter un utilisateur via addUser si isGroup est faux', async () => {
      service.hasWritePermission.mockResolvedValue(true)
      service.addUser.mockResolvedValue({ id: 'member-1' } as CourseMemberEntity)
      service.findById.mockResolvedValue(Optional.of({ id: 'member-1' } as CourseMemberEntity))

      await controller.create(req, 'course-1', { id: 'u1', role: CourseMemberRoles.student })

      expect(service.addUser).toHaveBeenCalledWith('course-1', 'u1', CourseMemberRoles.student)
      expect(service.addGroup).not.toHaveBeenCalled()
    })

    it('devrait ajouter un groupe via addGroup si isGroup est vrai', async () => {
      service.hasWritePermission.mockResolvedValue(true)
      service.addGroup.mockResolvedValue({ id: 'member-1' } as CourseMemberEntity)
      service.findById.mockResolvedValue(Optional.of({ id: 'member-1' } as CourseMemberEntity))

      await controller.create(req, 'course-1', { id: 'group-1', isGroup: true, role: CourseMemberRoles.teacher })

      expect(service.addGroup).toHaveBeenCalledWith('course-1', 'group-1', {
        notify: true,
        role: CourseMemberRoles.teacher,
      })
      expect(service.addUser).not.toHaveBeenCalled()
    })
  })

  describe('createTestMembers', () => {
    it("devrait lever une ForbiddenResponse sans permission d'écriture", async () => {
      service.hasWritePermission.mockResolvedValue(false)

      await expect(controller.createTestMembers(req, 'course-1', [])).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait ignorer les candidats déjà membres (même prénom/nom/email) et créer les nouveaux', async () => {
      service.hasWritePermission.mockResolvedValue(true)
      service.search.mockResolvedValue([
        [
          {
            id: 'existing-1',
            user: { firstName: 'Alice', lastName: 'Dupont', email: 'alice@test.local' },
          } as never,
        ],
        1,
      ])
      authService.createCandidateAccount.mockResolvedValue('new-user-id')
      service.addUser.mockResolvedValue({ id: 'new-member-1' } as CourseMemberEntity)
      service.findByIds.mockResolvedValue([{ id: 'new-member-1' } as CourseMemberEntity])

      const result = await controller.createTestMembers(req, 'course-1', [
        { firstName: 'Alice', lastName: 'Dupont', email: 'alice@test.local' } as never,
        { firstName: 'Bob', lastName: 'Martin', email: 'bob@test.local' } as never,
      ])

      expect(authService.createCandidateAccount).toHaveBeenCalledTimes(1)
      expect(service.addUser).toHaveBeenCalledWith('course-1', 'new-user-id', CourseMemberRoles.student, false)
      expect(result.total).toBe(1)
    })

    it("devrait retourner une liste vide si aucun candidat n'est ajouté", async () => {
      service.hasWritePermission.mockResolvedValue(true)
      service.search.mockResolvedValue([[], 0])

      const result = await controller.createTestMembers(req, 'course-1', [])

      expect(service.findByIds).not.toHaveBeenCalled()
      expect(result.total).toBe(0)
    })
  })

  describe('delete', () => {
    it("devrait lever une ForbiddenResponse sans permission d'écriture", async () => {
      service.hasWritePermission.mockResolvedValue(false)

      await expect(controller.delete(req, 'course-1', 'member-1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait supprimer le membre', async () => {
      service.hasWritePermission.mockResolvedValue(true)

      await controller.delete(req, 'course-1', 'member-1')

      expect(service.delete).toHaveBeenCalledWith('course-1', 'member-1')
    })
  })

  describe('archiveMyMembership', () => {
    it("devrait archiver l'adhésion de l'utilisateur courant et retourner le membre", async () => {
      service.getByUserIdAndCourseId.mockResolvedValue(Optional.of({ id: 'member-1' } as CourseMemberEntity))

      await controller.archiveMyMembership(req, 'course-1', { archived: true })

      expect(service.setArchivedByUser).toHaveBeenCalledWith('course-1', 'teacher-1', true)
    })
  })

  describe('updateRole', () => {
    it("devrait lever une ForbiddenResponse sans permission d'écriture", async () => {
      service.hasWritePermission.mockResolvedValue(false)

      await expect(
        controller.updateRole(req, 'course-1', { id: 'member-1', role: CourseMemberRoles.teacher })
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait mettre à jour le rôle et retourner le membre', async () => {
      service.hasWritePermission.mockResolvedValue(true)
      service.findById.mockResolvedValue(Optional.of({ id: 'member-1' } as CourseMemberEntity))

      await controller.updateRole(req, 'course-1', { id: 'member-1', role: CourseMemberRoles.teacher })

      expect(service.updateRole).toHaveBeenCalledWith('course-1', 'member-1', CourseMemberRoles.teacher)
    })
  })
})
