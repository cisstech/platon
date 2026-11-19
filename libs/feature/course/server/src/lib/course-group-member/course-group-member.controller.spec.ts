import { Test } from '@nestjs/testing'
import { ForbiddenResponse } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { CourseGroupService } from '../course-group/course-group.service'
import { CourseMemberEntity } from '../course-member/course-member.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseGroupMemberController } from './course-group-member.controller'
import { CourseGroupMemberEntity } from './course-group-member.entity'
import { CourseGroupMemberService } from './course-group-member.service'

describe('CourseGroupMemberController', () => {
  let controller: CourseGroupMemberController
  let groupMemberService: jest.Mocked<
    Pick<
      CourseGroupMemberService,
      'listCourseGroupMembers' | 'listGroupsMembers' | 'isMember' | 'deleteMember' | 'addCourseGroupMember'
    >
  >
  let courseMemberService: jest.Mocked<Pick<CourseMemberService, 'search'>>
  const req = { user: { id: 'teacher-1' } } as IRequest

  beforeEach(async () => {
    groupMemberService = {
      listCourseGroupMembers: jest.fn(),
      listGroupsMembers: jest.fn(),
      isMember: jest.fn(),
      deleteMember: jest.fn(),
      addCourseGroupMember: jest.fn(),
    }
    courseMemberService = { search: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseGroupMemberController,
        { provide: CourseGroupMemberService, useValue: groupMemberService },
        { provide: CourseMemberService, useValue: courseMemberService },
        {
          provide: CourseGroupService,
          useValue: {
            listCourseGroups: jest
              .fn()
              .mockResolvedValue([{ groupId: 'g1' }, { groupId: 'g2' }] as CourseGroupEntity[]),
          },
        },
        {
          provide: CoursePermissionsService,
          useValue: {
            ensureCourseReadPermission: jest.fn().mockResolvedValue(undefined),
            ensureGroupReadPermission: jest.fn().mockResolvedValue({ groupId: 'g1' }),
            ensureGroupWritePermission: jest.fn().mockResolvedValue({ groupId: 'g1' }),
          },
        },
      ],
    }).compile()

    controller = module.get(CourseGroupMemberController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('devrait croiser les membres du groupe avec les membres du cours', async () => {
      groupMemberService.listCourseGroupMembers.mockResolvedValue([
        { userId: 'u1', createdAt: new Date(), updatedAt: new Date() } as CourseGroupMemberEntity,
      ])
      courseMemberService.search.mockResolvedValue([
        [{ userId: 'u1' } as CourseMemberEntity, { userId: 'u2' } as CourseMemberEntity],
        2,
      ])

      const result = await controller.list(req, 'course-1', 'g1')

      expect(result.total).toBe(1)
      expect((result.resources[0] as unknown as CourseMemberEntity).userId).toBe('u1')
    })
  })

  describe('listGroupsMembers', () => {
    it('devrait croiser les membres de plusieurs groupes avec les membres du cours', async () => {
      groupMemberService.listGroupsMembers.mockResolvedValue([
        { userId: 'u1', createdAt: new Date(), updatedAt: new Date() } as CourseGroupMemberEntity,
      ])
      courseMemberService.search.mockResolvedValue([[{ userId: 'u1' } as CourseMemberEntity], 1])

      const result = await controller.listGroupsMembers(req, 'course-1', ['g1', 'g2'])

      expect(result.total).toBe(1)
      expect(groupMemberService.listGroupsMembers).toHaveBeenCalledWith(['g1', 'g2'])
    })

    it('reads no group of another course', async () => {
      groupMemberService.listGroupsMembers.mockResolvedValue([])
      courseMemberService.search.mockResolvedValue([[], 0])

      await controller.listGroupsMembers(req, 'course-1', ['g1', 'g9'])

      expect(groupMemberService.listGroupsMembers).toHaveBeenCalledWith(['g1'])
    })
  })

  describe('delete', () => {
    it("devrait lever une ForbiddenResponse si l'utilisateur n'est pas membre du groupe", async () => {
      groupMemberService.isMember.mockResolvedValue(false)

      await expect(controller.delete(req, 'course-1', 'g1', 'u1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait supprimer le membre du groupe', async () => {
      groupMemberService.isMember.mockResolvedValue(true)

      await controller.delete(req, 'course-1', 'g1', 'u1')

      expect(groupMemberService.deleteMember).toHaveBeenCalledWith('g1', 'u1')
    })
  })

  describe('create', () => {
    it('devrait lever une ForbiddenResponse si déjà membre', async () => {
      groupMemberService.isMember.mockResolvedValue(true)

      await expect(controller.create(req, 'course-1', 'g1', 'u1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait ajouter le membre au groupe', async () => {
      groupMemberService.isMember.mockResolvedValue(false)

      await controller.create(req, 'course-1', 'g1', 'u1')

      expect(groupMemberService.addCourseGroupMember).toHaveBeenCalledWith('g1', 'u1')
    })
  })
})
