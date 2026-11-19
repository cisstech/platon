import { Test } from '@nestjs/testing'
import { NotFoundResponse, UserRoles } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { Optional } from 'typescript-optional'
import { CoursePermissionsService } from '../permissions/permissions.service'
import { ActivityController } from './activity.controller'
import { ActivityEntity } from './activity.entity'
import { ActivityService } from './activity.service'

describe('ActivityController', () => {
  let controller: ActivityController
  let activityService: jest.Mocked<
    Pick<
      ActivityService,
      | 'search'
      | 'getCourseColors'
      | 'findByCourseId'
      | 'create'
      | 'createActivities'
      | 'updateActivitesOrder'
      | 'update'
      | 'reload'
      | 'delete'
      | 'close'
      | 'reopen'
      | 'regenerateCode'
      | 'updateRestrictions'
      | 'fromInput'
    >
  >
  let permissionsService: jest.Mocked<
    Pick<
      CoursePermissionsService,
      'ensureActivityReadPermission' | 'ensureCourseWritePermission' | 'ensureActivityWritePermission'
    >
  >
  const req = { user: { id: 'teacher-1', role: UserRoles.teacher } } as IRequest
  const studentReq = { user: { id: 'student-1', role: UserRoles.student } } as IRequest

  beforeEach(async () => {
    activityService = {
      search: jest.fn(),
      getCourseColors: jest.fn(),
      findByCourseId: jest.fn(),
      create: jest.fn(),
      createActivities: jest.fn(),
      updateActivitesOrder: jest.fn(),
      update: jest.fn(),
      reload: jest.fn(),
      delete: jest.fn(),
      close: jest.fn(),
      reopen: jest.fn(),
      regenerateCode: jest.fn(),
      updateRestrictions: jest.fn(),
      fromInput: jest.fn().mockImplementation(async (input) => input),
    }
    permissionsService = {
      ensureActivityReadPermission: jest.fn().mockResolvedValue(undefined),
      ensureCourseWritePermission: jest.fn().mockResolvedValue(undefined),
      ensureActivityWritePermission: jest.fn().mockResolvedValue(undefined),
    }

    const module = await Test.createTestingModule({
      providers: [
        ActivityController,
        { provide: ActivityService, useValue: activityService },
        { provide: CoursePermissionsService, useValue: permissionsService },
      ],
    }).compile()

    controller = module.get(ActivityController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('search devrait retourner la liste mappée', async () => {
    activityService.search.mockResolvedValue([[{ id: 'a1' } as ActivityEntity], 1])

    const result = await controller.search(req, 'course-1')

    expect(result.total).toBe(1)
  })

  it('search devrait masquer le code de déblocage pour un étudiant', async () => {
    activityService.search.mockResolvedValue([[{ id: 'a1', code: 'ABC123' } as ActivityEntity], 1])

    const result = await controller.search(studentReq, 'course-1')

    expect(result.resources[0].code).toBeUndefined()
  })

  it('search devrait conserver le code de déblocage pour un professeur', async () => {
    activityService.search.mockResolvedValue([[{ id: 'a1', code: 'ABC123' } as ActivityEntity], 1])

    const result = await controller.search(req, 'course-1')

    expect(result.resources[0].code).toBe('ABC123')
  })

  it('getCourseColors devrait retourner les couleurs', async () => {
    activityService.getCourseColors.mockResolvedValue([1, 2])

    const result = await controller.getCourseColors(req, 'course-1')

    expect(result.resource).toEqual([1, 2])
  })

  describe('find', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      activityService.findByCourseId.mockResolvedValue(Optional.empty())

      await expect(controller.find(req, 'course-1', 'activity-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait vérifier la permission de lecture puis retourner l'activité", async () => {
      const activity = { id: 'activity-1' } as ActivityEntity
      activityService.findByCourseId.mockResolvedValue(Optional.of(activity))

      const result = await controller.find(req, 'course-1', 'activity-1')

      expect(permissionsService.ensureActivityReadPermission).toHaveBeenCalledWith(activity, req)
      expect(result.resource.id).toBe('activity-1')
    })

    it('devrait masquer le code de déblocage pour un étudiant', async () => {
      const activity = { id: 'activity-1', code: 'ABC123' } as ActivityEntity
      activityService.findByCourseId.mockResolvedValue(Optional.of(activity))

      const result = await controller.find(studentReq, 'course-1', 'activity-1')

      expect(result.resource.code).toBeUndefined()
    })

    it('devrait conserver le code de déblocage pour un professeur', async () => {
      const activity = { id: 'activity-1', code: 'ABC123' } as ActivityEntity
      activityService.findByCourseId.mockResolvedValue(Optional.of(activity))

      const result = await controller.find(req, 'course-1', 'activity-1')

      expect(result.resource.code).toBe('ABC123')
    })
  })

  it('create devrait vérifier la permission puis créer avec courseId/creatorId', async () => {
    activityService.create.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.create(req, 'course-1', { title: 'x' } as never)

    expect(permissionsService.ensureCourseWritePermission).toHaveBeenCalledWith('course-1', req)
    expect(activityService.create).toHaveBeenCalledWith(
      expect.objectContaining({ courseId: 'course-1', creatorId: 'teacher-1' })
    )
  })

  it('createActivities devrait créer chaque activité avec courseId/creatorId', async () => {
    activityService.createActivities.mockResolvedValue([{ id: 'a1' } as ActivityEntity])

    const result = await controller.createActivities(req, 'course-1', { activities: [{}, {}] } as never)

    expect(permissionsService.ensureCourseWritePermission).toHaveBeenCalledWith('course-1', req)
    expect(activityService.createActivities).toHaveBeenCalledWith([
      expect.objectContaining({ courseId: 'course-1', creatorId: 'teacher-1' }),
      expect.objectContaining({ courseId: 'course-1', creatorId: 'teacher-1' }),
    ])
    expect(result.total).toBe(1)
  })

  it('changeOrder devrait vérifier la permission puis déléguer', async () => {
    await controller.changeOrder(req, 'course-1', ['a1', 'a2'])

    expect(permissionsService.ensureCourseWritePermission).toHaveBeenCalledWith('course-1', req)
    expect(activityService.updateActivitesOrder).toHaveBeenCalledWith('course-1', ['a1', 'a2'])
  })

  it('update devrait déléguer avec un guard de permission écriture', async () => {
    activityService.update.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.update(req, 'course-1', 'activity-1', {} as never)

    expect(activityService.update).toHaveBeenCalledWith(
      'course-1',
      'activity-1',
      expect.anything(),
      expect.any(Function)
    )
  })

  it('reload devrait déléguer avec un guard de permission écriture', async () => {
    activityService.reload.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.reload(req, 'course-1', 'activity-1', {} as never)

    expect(activityService.reload).toHaveBeenCalledWith('course-1', 'activity-1', {}, expect.any(Function))
  })

  it('delete devrait déléguer avec un guard de permission écriture', async () => {
    await controller.delete(req, 'course-1', 'activity-1')

    expect(activityService.delete).toHaveBeenCalledWith('course-1', 'activity-1', expect.any(Function))
  })

  it('close devrait déléguer avec un guard de permission écriture', async () => {
    activityService.close.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.close(req, 'course-1', 'activity-1')

    expect(activityService.close).toHaveBeenCalledWith('course-1', 'activity-1', expect.any(Function))
  })

  it('reopen devrait déléguer avec un guard de permission écriture', async () => {
    activityService.reopen.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.reopen(req, 'course-1', 'activity-1')

    expect(activityService.reopen).toHaveBeenCalledWith('course-1', 'activity-1', expect.any(Function))
  })

  it('regenerateCode devrait déléguer avec un guard de permission écriture', async () => {
    activityService.regenerateCode.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.regenerateCode(req, 'course-1', 'activity-1')

    expect(activityService.regenerateCode).toHaveBeenCalledWith('course-1', 'activity-1', expect.any(Function))
  })

  it('updateRestrictions devrait déléguer avec un guard de permission écriture', async () => {
    activityService.updateRestrictions.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.updateRestrictions(req, 'course-1', 'activity-1', [])

    expect(activityService.updateRestrictions).toHaveBeenCalledWith('course-1', 'activity-1', [], expect.any(Function))
  })

  it('les guards de permission passés aux méthodes de service délèguent bien à ensureActivityWritePermission', async () => {
    activityService.close.mockResolvedValue({ id: 'a1' } as ActivityEntity)

    await controller.close(req, 'course-1', 'activity-1')
    const guard = activityService.close.mock.calls[0][2] as (activity: ActivityEntity) => Promise<void>
    await guard({ id: 'a1' } as ActivityEntity)

    expect(permissionsService.ensureActivityWritePermission).toHaveBeenCalledWith({ id: 'a1' }, req)
  })
})
