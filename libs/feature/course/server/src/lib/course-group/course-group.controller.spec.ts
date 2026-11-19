import { Test } from '@nestjs/testing'
import { IRequest } from '@platon/core/server'
import { CourseGroupMemberService } from '../course-group-member/course-group-member.service'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { CourseGroupController } from './course-group.controller'
import { CourseGroupEntity } from './course-group.entity'
import { CourseGroupService } from './course-group.service'

describe('CourseGroupController', () => {
  let controller: CourseGroupController
  let groupService: jest.Mocked<
    Pick<CourseGroupService, 'listCourseGroups' | 'update' | 'addCourseGroup' | 'delete' | 'isMember'>
  >
  let groupMemberService: jest.Mocked<Pick<CourseGroupMemberService, 'deleteAllMembersFromGroup'>>
  const req = { user: { id: 'user-1' } } as IRequest
  const permissions = {
    ensureCourseReadPermission: jest.fn().mockResolvedValue(undefined),
    ensureCourseWritePermission: jest.fn().mockResolvedValue(undefined),
    ensureGroupWritePermission: jest.fn().mockResolvedValue({ groupId: 'g1', courseId: 'course-1' }),
  }

  beforeEach(async () => {
    groupService = {
      listCourseGroups: jest.fn(),
      update: jest.fn(),
      addCourseGroup: jest.fn(),
      delete: jest.fn(),
      isMember: jest.fn(),
    }
    groupMemberService = { deleteAllMembersFromGroup: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseGroupController,
        { provide: CourseGroupService, useValue: groupService },
        { provide: CourseGroupMemberService, useValue: groupMemberService },
        { provide: CoursePermissionsService, useValue: permissions },
      ],
    }).compile()

    controller = module.get(CourseGroupController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('list devrait retourner la liste des groupes', async () => {
    groupService.listCourseGroups.mockResolvedValue([{ groupId: 'g1' } as CourseGroupEntity])

    const result = await controller.list(req, 'course-1')

    expect(result.total).toBe(1)
  })

  it('update devrait déléguer au service', async () => {
    groupService.update.mockResolvedValue({ groupId: 'g1', name: 'New' } as CourseGroupEntity)

    await controller.update(req, 'course-1', 'g1', { name: 'New' } as never)

    expect(groupService.update).toHaveBeenCalledWith('course-1', 'g1', { name: 'New' })
  })

  it('create devrait ajouter un groupe au cours', async () => {
    groupService.addCourseGroup.mockResolvedValue({ groupId: 'g1' } as CourseGroupEntity)

    await controller.create(req, 'course-1')

    expect(groupService.addCourseGroup).toHaveBeenCalledWith('course-1')
  })

  it('delete devrait supprimer les membres puis le groupe', async () => {
    await controller.delete(req, 'course-1', 'g1')

    expect(groupMemberService.deleteAllMembersFromGroup).toHaveBeenCalledWith('g1')
    expect(groupService.delete).toHaveBeenCalledWith('course-1', 'g1')
  })

  it('isMemberOfGroup devrait retourner le statut de membre', async () => {
    groupService.isMember.mockResolvedValue(true)

    const result = await controller.isMemberOfGroup(req, 'course-1', 'g1')

    expect(result.resource).toBe(true)
  })
})
