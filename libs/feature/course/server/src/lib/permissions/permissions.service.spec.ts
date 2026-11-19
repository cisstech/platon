import { Test } from '@nestjs/testing'
import { ForbiddenResponse, NotFoundResponse } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { Optional } from 'typescript-optional'
import { ActivityGroupService } from '../activity-group/activity-group.service'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { ActivityEntity } from '../activity/activity.entity'
import { ActivityService } from '../activity/activity.service'
import { CourseGroupEntity } from '../course-group/course-group.entity'
import { CourseGroupService } from '../course-group/course-group.service'
import { CourseMemberService } from '../course-member/course-member.service'
import { CoursePermissionsService } from './permissions.service'

describe('CoursePermissionsService', () => {
  let service: CoursePermissionsService
  let courseMemberService: jest.Mocked<Pick<CourseMemberService, 'isMember' | 'hasWritePermission'>>
  let activityMemberService: jest.Mocked<Pick<ActivityMemberService, 'isPrivateMember' | 'isMember'>>
  let activityGroupService: jest.Mocked<Pick<ActivityGroupService, 'isUserInActivityGroup' | 'numberOfGroups'>>
  let activityService: jest.Mocked<Pick<ActivityService, 'findByActivityId'>>
  let courseGroupService: jest.Mocked<Pick<CourseGroupService, 'findInCourse'>>

  const req = { user: { id: 'user-1', role: 'student' } } as IRequest

  beforeEach(async () => {
    courseMemberService = { isMember: jest.fn(), hasWritePermission: jest.fn() }
    activityMemberService = { isPrivateMember: jest.fn(), isMember: jest.fn() }
    activityGroupService = { isUserInActivityGroup: jest.fn(), numberOfGroups: jest.fn() }
    activityService = { findByActivityId: jest.fn() }
    courseGroupService = { findInCourse: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CoursePermissionsService,
        { provide: CourseMemberService, useValue: courseMemberService },
        { provide: ActivityMemberService, useValue: activityMemberService },
        { provide: ActivityGroupService, useValue: activityGroupService },
        { provide: ActivityService, useValue: activityService },
        { provide: CourseGroupService, useValue: courseGroupService },
      ],
    }).compile()

    service = module.get(CoursePermissionsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('ensureGroupReadPermission and ensureGroupWritePermission', () => {
    const group = { groupId: 'td-1', courseId: 'course-1' } as CourseGroupEntity

    it('give the group of the course to who may read it, or write it', async () => {
      courseMemberService.isMember.mockResolvedValue(true)
      courseMemberService.hasWritePermission.mockResolvedValue(true)
      courseGroupService.findInCourse.mockResolvedValue(group)

      await expect(service.ensureGroupReadPermission('course-1', 'td-1', req)).resolves.toBe(group)
      await expect(service.ensureGroupWritePermission('course-1', 'td-1', req)).resolves.toBe(group)
      expect(courseGroupService.findInCourse).toHaveBeenCalledWith('course-1', 'td-1')
    })

    it('say a group missing from the course is not found', async () => {
      courseMemberService.isMember.mockResolvedValue(true)
      courseMemberService.hasWritePermission.mockResolvedValue(true)
      courseGroupService.findInCourse.mockResolvedValue(null)

      await expect(service.ensureGroupReadPermission('course-1', 'td-9', req)).rejects.toBeInstanceOf(NotFoundResponse)
      await expect(service.ensureGroupWritePermission('course-1', 'td-9', req)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('refuse who may not read or write the course before looking for the group', async () => {
      courseMemberService.isMember.mockResolvedValue(false)
      courseMemberService.hasWritePermission.mockResolvedValue(false)

      await expect(service.ensureGroupReadPermission('course-1', 'td-1', req)).rejects.toBeInstanceOf(ForbiddenResponse)
      await expect(service.ensureGroupWritePermission('course-1', 'td-1', req)).rejects.toBeInstanceOf(
        ForbiddenResponse
      )
      expect(courseGroupService.findInCourse).not.toHaveBeenCalled()
    })
  })

  describe('ensureCourseReadPermission', () => {
    it('devrait passer sans vérification pour un admin', async () => {
      await service.ensureCourseReadPermission('course-1', { user: { id: 'u1', role: 'admin' } } as IRequest)

      expect(courseMemberService.isMember).not.toHaveBeenCalled()
    })

    it("devrait lever une ForbiddenResponse si l'utilisateur n'est pas membre", async () => {
      courseMemberService.isMember.mockResolvedValue(false)

      await expect(service.ensureCourseReadPermission('course-1', req)).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait passer si membre', async () => {
      courseMemberService.isMember.mockResolvedValue(true)

      await expect(service.ensureCourseReadPermission('course-1', req)).resolves.toBeUndefined()
    })
  })

  describe('ensureCourseWritePermission', () => {
    it("devrait lever une ForbiddenResponse sans permission d'écriture", async () => {
      courseMemberService.hasWritePermission.mockResolvedValue(false)

      await expect(service.ensureCourseWritePermission('course-1', req)).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("devrait passer avec permission d'écriture", async () => {
      courseMemberService.hasWritePermission.mockResolvedValue(true)

      await expect(service.ensureCourseWritePermission('course-1', req)).resolves.toBeUndefined()
    })
  })

  describe('ensureActivityReadPermission', () => {
    const activity = { id: 'activity-1', courseId: 'course-1', creatorId: 'someone-else' } as ActivityEntity

    it("devrait lever une NotFoundResponse si l'activité (passée par id) est introuvable", async () => {
      activityService.findByActivityId.mockResolvedValue(Optional.empty())

      await expect(service.ensureActivityReadPermission('activity-1', req)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait résoudre l'activité par id si une string est passée", async () => {
      activityService.findByActivityId.mockResolvedValue(Optional.of(activity))
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.ensureActivityReadPermission('activity-1', req)).rejects.toBeInstanceOf(ForbiddenResponse)
      expect(activityService.findByActivityId).toHaveBeenCalledWith('activity-1')
    })

    it('devrait passer pour un enseignant même si les autres vérifications échouent (toutes calculées, mais court-circuitées par isTeacher)', async () => {
      const teacherReq = { user: { id: 'u1', role: 'teacher' } } as IRequest
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.ensureActivityReadPermission(activity, teacherReq)).resolves.toBeUndefined()
    })

    it('devrait passer si membre privé', async () => {
      activityMemberService.isPrivateMember.mockResolvedValue(true)

      await expect(service.ensureActivityReadPermission(activity, req)).resolves.toBeUndefined()
    })

    it('devrait passer si membre du groupe activité', async () => {
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(true)

      await expect(service.ensureActivityReadPermission(activity, req)).resolves.toBeUndefined()
    })

    it("devrait passer si membre ET aucun groupe n'est associé à l'activité", async () => {
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(true)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.ensureActivityReadPermission(activity, req)).resolves.toBeUndefined()
    })

    it("devrait rejeter si membre mais que l'activité a des groupes (accès restreint au groupe)", async () => {
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(true)
      activityGroupService.numberOfGroups.mockResolvedValue(2)

      await expect(service.ensureActivityReadPermission(activity, req)).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait rejeter si aucune des conditions ne correspond', async () => {
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.ensureActivityReadPermission(activity, req)).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })

  describe('ensureActivityWritePermission', () => {
    it("devrait passer directement si l'utilisateur est le créateur de l'activité", async () => {
      const activity = { id: 'activity-1', courseId: 'course-1', creatorId: 'user-1' } as ActivityEntity

      await expect(service.ensureActivityWritePermission(activity, req)).resolves.toBeUndefined()
      expect(courseMemberService.hasWritePermission).not.toHaveBeenCalled()
    })

    it('devrait déléguer à ensureCourseWritePermission si pas créateur', async () => {
      const activity = { id: 'activity-1', courseId: 'course-1', creatorId: 'someone-else' } as ActivityEntity
      courseMemberService.hasWritePermission.mockResolvedValue(true)

      await expect(service.ensureActivityWritePermission(activity, req)).resolves.toBeUndefined()
      expect(courseMemberService.hasWritePermission).toHaveBeenCalledWith('course-1', req.user)
    })

    it("devrait résoudre l'activité par id puis vérifier la permission d'écriture cours", async () => {
      const activity = { id: 'activity-1', courseId: 'course-1', creatorId: 'someone-else' } as ActivityEntity
      activityService.findByActivityId.mockResolvedValue(Optional.of(activity))
      courseMemberService.hasWritePermission.mockResolvedValue(false)

      await expect(service.ensureActivityWritePermission('activity-1', req)).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })
})
