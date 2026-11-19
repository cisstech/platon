import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ForbiddenResponse, NotFoundResponse, User } from '@platon/core/common'
import { DatabaseService, EventService } from '@platon/core/server'
import { MockRepository, mockRepository, mockSelectQueryBuilder } from '@platon/core/testing/server'
import { ResourceEntity, ResourceFileService, ResourceService } from '@platon/feature/resource/server'
import { CLS_REQ } from 'nestjs-cls'
import { Optional } from 'typescript-optional'
import { ActivityGroupService } from '../activity-group/activity-group.service'
import { ActivityMemberService } from '../activity-member/activity-member.service'
import { CourseGroupMemberEntity } from '../course-group-member/course-group-member.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { ActivityDatesService } from './activity-dates.service'
import { ActivityEntity } from './activity.entity'
import { ActivityService } from './activity.service'
import { ON_RELOAD_ACTIVITY_EVENT } from './activity.event'
import { CourseNotificationService } from '../course-notification/course-notification.service'

describe('ActivityService', () => {
  let service: ActivityService
  let repository: MockRepository<ActivityEntity>
  let resourceRepository: MockRepository<ResourceEntity>
  let courseGroupMemberRepository: MockRepository<CourseGroupMemberEntity>
  let fileService: jest.Mocked<Pick<ResourceFileService, 'compile'>>
  let eventService: jest.Mocked<Pick<EventService, 'emit'>>
  let databaseService: jest.Mocked<Pick<DatabaseService, 'resolveVirtualColumns'>>
  let notificationService: jest.Mocked<Pick<CourseNotificationService, 'notifyActivityBeingClosed'>>
  let activityMemberService: jest.Mocked<Pick<ActivityMemberService, 'isPrivateMember' | 'isMember'>>
  let courseMemberService: jest.Mocked<Pick<CourseMemberService, 'hasWritePermission'>>
  let activityDatesService: jest.Mocked<
    Pick<ActivityDatesService, 'updateActivitiesDates' | 'reopenOrCloseAllRestrictions'>
  >
  let activityGroupService: jest.Mocked<Pick<ActivityGroupService, 'isUserInActivityGroup' | 'numberOfGroups'>>
  let resourceService: jest.Mocked<Pick<ResourceService, 'findByIdOrCode'>>
  let request: { user: User }

  const buildActivity = (overrides: Partial<ActivityEntity> = {}): ActivityEntity =>
    ({
      id: 'activity-1',
      courseId: 'course-1',
      creatorId: 'creator-1',
      source: { variables: {} },
      restrictions: [],
      ...overrides,
    } as unknown as ActivityEntity)

  beforeEach(async () => {
    repository = mockRepository<ActivityEntity>()
    resourceRepository = mockRepository<ResourceEntity>()
    resourceRepository.find.mockResolvedValue([])
    courseGroupMemberRepository = mockRepository<CourseGroupMemberEntity>()
    fileService = { compile: jest.fn() }
    eventService = { emit: jest.fn() }
    databaseService = { resolveVirtualColumns: jest.fn().mockResolvedValue(undefined) }
    notificationService = { notifyActivityBeingClosed: jest.fn().mockResolvedValue(undefined) }
    activityMemberService = { isPrivateMember: jest.fn(), isMember: jest.fn() }
    courseMemberService = { hasWritePermission: jest.fn().mockResolvedValue(false) }
    activityDatesService = {
      updateActivitiesDates: jest.fn().mockResolvedValue({ start: undefined, end: undefined }),
      reopenOrCloseAllRestrictions: jest.fn().mockResolvedValue(undefined),
    }
    activityGroupService = { isUserInActivityGroup: jest.fn(), numberOfGroups: jest.fn() }
    resourceService = { findByIdOrCode: jest.fn() }
    request = { user: { id: 'user-1', role: 'student' } as User }

    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: CLS_REQ, useValue: request },
        { provide: ResourceFileService, useValue: fileService },
        { provide: EventService, useValue: eventService },
        { provide: DatabaseService, useValue: databaseService },
        { provide: CourseNotificationService, useValue: notificationService },
        { provide: ActivityMemberService, useValue: activityMemberService },
        { provide: CourseMemberService, useValue: courseMemberService },
        { provide: ActivityDatesService, useValue: activityDatesService },
        { provide: getRepositoryToken(ActivityEntity), useValue: repository },
        { provide: getRepositoryToken(ResourceEntity), useValue: resourceRepository },
        { provide: getRepositoryToken(CourseGroupMemberEntity), useValue: courseGroupMemberRepository },
        { provide: ActivityGroupService, useValue: activityGroupService },
        { provide: ResourceService, useValue: resourceService },
      ],
    }).compile()

    service = module.get(ActivityService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('devrait utiliser une requête simple (sans jointure membre) pour un admin', async () => {
      request.user = { ...request.user, role: 'admin' } as User
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getManyAndCount.mockResolvedValue([[], 0])
      repository.createQueryBuilder.mockReturnValue(qb)

      await service.search('course-1')

      expect(qb.where).toHaveBeenCalledWith(`activity.course_id = :courseId`, { courseId: 'course-1' })
      expect(qb.leftJoin).not.toHaveBeenCalled()
    })

    it('devrait joindre la vue membre et le sous-select de groupe pour un non-admin', async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getManyAndCount.mockResolvedValue([[], 0])
      repository.createQueryBuilder.mockReturnValue(qb)
      const subQb = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      }
      courseGroupMemberRepository.createQueryBuilder.mockReturnValue(subQb as never)

      await service.search('course-1')

      expect(qb.leftJoin).toHaveBeenCalled()
      expect(qb.andWhere).toHaveBeenCalled()
    })

    it('devrait filtrer par sectionId et challenge', async () => {
      request.user = { ...request.user, role: 'admin' } as User
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getManyAndCount.mockResolvedValue([[], 0])
      repository.createQueryBuilder.mockReturnValue(qb)

      await service.search('course-1', { sectionId: 'section-1', challenge: true })

      expect(qb.andWhere).toHaveBeenCalledWith(`section_id = :sectionId`, { sectionId: 'section-1' })
      expect(qb.andWhere).toHaveBeenCalledWith(`is_challenge = :isChallenge`, { isChallenge: true })
    })
  })

  describe('findByIdForUser', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getOne.mockResolvedValue(null)
      repository.createQueryBuilder.mockReturnValue(qb)

      await expect(service.findByIdForUser('activity-1', request.user)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait autoriser le créateur de l'activité", async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      const activity = buildActivity({ creatorId: 'user-1' })
      qb.getOne.mockResolvedValue(activity)
      repository.createQueryBuilder.mockReturnValue(qb)
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.findByIdForUser('activity-1', request.user)).resolves.toBe(activity)
    })

    it("devrait lever une ForbiddenResponse si aucune condition d'accès n'est remplie", async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      const activity = buildActivity({ creatorId: 'someone-else' })
      qb.getOne.mockResolvedValue(activity)
      repository.createQueryBuilder.mockReturnValue(qb)
      activityMemberService.isPrivateMember.mockResolvedValue(false)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.findByIdForUser('activity-1', request.user)).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait autoriser un membre privé', async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      const activity = buildActivity({ creatorId: 'someone-else' })
      qb.getOne.mockResolvedValue(activity)
      repository.createQueryBuilder.mockReturnValue(qb)
      activityMemberService.isPrivateMember.mockResolvedValue(true)
      activityGroupService.isUserInActivityGroup.mockResolvedValue(false)
      activityMemberService.isMember.mockResolvedValue(false)
      activityGroupService.numberOfGroups.mockResolvedValue(0)

      await expect(service.findByIdForUser('activity-1', request.user)).resolves.toBe(activity)
    })
  })

  describe('findByActivityId', () => {
    it('devrait retourner Optional.empty() si non trouvé', async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getOne.mockResolvedValue(null)
      repository.createQueryBuilder.mockReturnValue(qb)

      await expect((await service.findByActivityId('activity-1')).isEmpty()).toBe(true)
    })

    it('devrait mettre à jour les dates et colonnes virtuelles si trouvé', async () => {
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      const activity = buildActivity()
      qb.getOne.mockResolvedValue(activity)
      repository.createQueryBuilder.mockReturnValue(qb)
      courseMemberService.hasWritePermission.mockResolvedValue(true)

      const result = await service.findByActivityId('activity-1')

      expect(activityDatesService.updateActivitiesDates).toHaveBeenCalledWith([activity])
      expect(databaseService.resolveVirtualColumns).toHaveBeenCalled()
      expect(result.get()).toBe(activity)
    })
  })

  describe('findActivitiesByCourseId', () => {
    it('devrait retourner Optional.empty() sans activité', async () => {
      repository.find.mockResolvedValue([])

      await expect((await service.findActivitiesByCourseId('course-1')).isEmpty()).toBe(true)
    })

    it('devrait retourner les activités trouvées', async () => {
      const activities = [buildActivity()]
      repository.find.mockResolvedValue(activities)

      await expect((await service.findActivitiesByCourseId('course-1')).get()).toBe(activities)
    })
  })

  describe('create', () => {
    it("devrait démarrer à l'ordre 1 sans activité existante", async () => {
      repository.maximum.mockResolvedValue(null)
      const saved = buildActivity({ order: 1 })
      repository.save.mockResolvedValue(saved)

      await service.create({ courseId: 'course-1', sectionId: 'section-1' })

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 'course-1', sectionId: 'section-1', order: 1 })
      )
    })

    it("devrait incrémenter l'ordre maximum existant", async () => {
      repository.maximum.mockResolvedValue(5)
      repository.save.mockResolvedValue(buildActivity({ order: 6 }))

      await service.create({ courseId: 'course-1', sectionId: 'section-1' })

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ order: 6 }))
    })
  })

  describe('updateActivitesOrder', () => {
    it('devrait sauvegarder les ids avec leur index comme ordre', async () => {
      await service.updateActivitesOrder(['a1', 'a2', 'a3'])

      expect(repository.save).toHaveBeenCalledWith([
        { id: 'a1', order: 0 },
        { id: 'a2', order: 1 },
        { id: 'a3', order: 2 },
      ])
    })
  })

  describe('update', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.update('course-1', 'activity-1', {})).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait appeler le guard avant la sauvegarde', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockResolvedValue(activity)
      const guard = jest.fn()

      await service.update('course-1', 'activity-1', {}, guard)

      expect(guard).toHaveBeenCalledWith(activity)
    })

    it('devrait fusionner activitySettings dans source.variables.settings', async () => {
      const activity = buildActivity({ source: { variables: {} } as never })
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      await service.update('course-1', 'activity-1', { activitySettings: { foo: 'bar' } as never })

      expect(activity.source.variables.settings).toEqual({ foo: 'bar' })
    })

    it('devrait retirer les colonnes virtuelles avant la sauvegarde', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      // Snapshot pris au moment de l'appel : l'objet est le même que celui muté ensuite par
      // addVirtualColumns, donc l'inspecter après résolution de update() verrait déjà "state" réapparu.
      let savedArg: Partial<ActivityEntity> | undefined
      repository.save.mockImplementation(async (a) => {
        savedArg = { ...(a as ActivityEntity) }
        return a as ActivityEntity
      })

      await service.update('course-1', 'activity-1', { code: 'ABC123' })

      expect(savedArg?.code).toBe('ABC123')
      expect(savedArg?.title).toBeUndefined()
      expect(savedArg?.state).toBeUndefined()
    })

    it("devrait enregistrer qu'une activité est notée", async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      await service.update('course-1', 'activity-1', { graded: true })

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ graded: true }))
    })
  })

  describe('updateRestrictions', () => {
    it('devrait déléguer à update avec les restrictions', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockResolvedValue(activity)

      await service.updateRestrictions('course-1', 'activity-1', [])

      expect(repository.save).toHaveBeenCalled()
    })
  })

  describe('reload', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.reload('course-1', 'activity-1', {} as never)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait recompiler la source en conservant activitySettings et émettre un événement', async () => {
      const activity = buildActivity({
        source: { resource: 'res-1', variables: { settings: { foo: 'bar' } } } as never,
      })
      repository.findOne.mockResolvedValue(activity)
      fileService.compile.mockResolvedValue({
        source: { variables: {} },
      } as never)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      const result = await service.reload('course-1', 'activity-1', { version: 'v2' } as never)

      expect(fileService.compile).toHaveBeenCalledWith({ resourceId: 'res-1', version: 'v2' })
      expect(result.source.variables.settings).toEqual({ foo: 'bar' })
      expect(eventService.emit).toHaveBeenCalledWith(ON_RELOAD_ACTIVITY_EVENT, expect.anything())
    })
  })

  describe('close', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.close('course-1', 'activity-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait fermer les restrictions, notifier et mettre à jour closeAt', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      const result = await service.close('course-1', 'activity-1')

      expect(notificationService.notifyActivityBeingClosed).toHaveBeenCalledWith('activity-1')
      expect(activityDatesService.reopenOrCloseAllRestrictions).toHaveBeenCalledWith(activity, false)
      expect(result.closeAt).toBeInstanceOf(Date)
    })
  })

  describe('reopen', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.reopen('course-1', 'activity-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait rouvrir les restrictions et remettre closeAt à null', async () => {
      const activity = buildActivity({ closeAt: new Date() })
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      const result = await service.reopen('course-1', 'activity-1')

      expect(activityDatesService.reopenOrCloseAllRestrictions).toHaveBeenCalledWith(activity, true)
      expect(result.closeAt).toBeNull()
    })
  })

  describe('regenerateCode', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.regenerateCode('course-1', 'activity-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait générer un nouveau code à 6 caractères', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      repository.save.mockImplementation(async (a) => a as ActivityEntity)

      const result = await service.regenerateCode('course-1', 'activity-1')

      expect(result.code).toMatch(/^[0-9A-Z]{6}$/)
    })
  })

  describe('delete', () => {
    it("devrait lever une NotFoundResponse si l'activité n'existe pas", async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.delete('course-1', 'activity-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait appeler le guard puis supprimer', async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      const guard = jest.fn()

      await service.delete('course-1', 'activity-1', guard)

      expect(guard).toHaveBeenCalledWith(activity)
      expect(repository.remove).toHaveBeenCalledWith(activity)
    })
  })

  describe('withActivity', () => {
    it('devrait appeler le consumer avec null si introuvable', async () => {
      repository.findOne.mockResolvedValue(null)
      const consumer = jest.fn()

      await service.withActivity('activity-1', consumer)

      expect(consumer).toHaveBeenCalledWith(null)
    })

    it("devrait appeler le consumer avec l'activité trouvée", async () => {
      const activity = buildActivity()
      repository.findOne.mockResolvedValue(activity)
      const consumer = jest.fn()

      await service.withActivity('activity-1', consumer)

      expect(consumer).toHaveBeenCalledWith(activity)
    })
  })

  describe('fromInput', () => {
    it('devrait assigner directement les champs sans resourceId', async () => {
      const result = await service.fromInput({ courseId: 'course-1' } as never)

      expect(result.courseId).toBe('course-1')
      expect(fileService.compile).not.toHaveBeenCalled()
    })

    it('devrait compiler la source et retirer resourceId/resourceVersion pour une création', async () => {
      fileService.compile.mockResolvedValue({ source: { variables: {} } } as never)

      const result = await service.fromInput({ resourceId: 'res-1', resourceVersion: 'v1' } as never)

      expect(fileService.compile).toHaveBeenCalledWith({ resourceId: 'res-1', version: 'v1' })
      expect((result as unknown as { resourceId?: string }).resourceId).toBeUndefined()
    })

    it("devrait lever une NotFoundResponse avec le titre si l'activité liée à resourceId existe déjà", async () => {
      fileService.compile.mockRejectedValue(new Error('compile failed'))
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getOne.mockResolvedValue(buildActivity({ id: 'existing', title: 'My activity' } as never))
      repository.createQueryBuilder.mockReturnValue(qb)

      await expect(service.fromInput({ resourceId: 'res-1', resourceVersion: 'v2' } as never)).rejects.toBeInstanceOf(
        NotFoundResponse
      )
    })

    it("devrait lever une NotFoundResponse avec le nom de la ressource si aucune activité liée n'existe mais la ressource oui", async () => {
      fileService.compile.mockRejectedValue(new Error('compile failed'))
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getOne.mockResolvedValue(null)
      repository.createQueryBuilder.mockReturnValue(qb)
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of({ name: 'My resource' } as ResourceEntity))

      await expect(service.fromInput({ resourceId: 'res-1', resourceVersion: 'v2' } as never)).rejects.toBeInstanceOf(
        NotFoundResponse
      )
    })

    it("devrait relancer l'erreur d'origine si ni activité ni ressource ne sont trouvées", async () => {
      const originalError = new Error('compile failed')
      fileService.compile.mockRejectedValue(originalError)
      const qb = mockSelectQueryBuilder<ActivityEntity>()
      qb.getOne.mockResolvedValue(null)
      repository.createQueryBuilder.mockReturnValue(qb)
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(service.fromInput({ resourceId: 'res-1', resourceVersion: 'v2' } as never)).rejects.toBe(
        originalError
      )
    })
  })

  describe('getCourseColors', () => {
    it('devrait ignorer les couleurs indéfinies ou négatives', async () => {
      repository.find.mockResolvedValue([
        buildActivity({ colorHue: undefined }),
        buildActivity({ colorHue: -1 }),
        buildActivity({ colorHue: 5 }),
      ] as never)

      await expect(service.getCourseColors('course-1')).resolves.toEqual([5])
    })

    it('devrait trier les couleurs par fréquence décroissante', async () => {
      repository.find.mockResolvedValue([
        buildActivity({ colorHue: 1 }),
        buildActivity({ colorHue: 2 }),
        buildActivity({ colorHue: 2 }),
      ] as never)

      await expect(service.getCourseColors('course-1')).resolves.toEqual([2, 1])
    })
  })
})
