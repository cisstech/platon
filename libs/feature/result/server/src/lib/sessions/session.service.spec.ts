import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MockRepository, mockRepository } from '@platon/core/testing/server'
import { ActivityService } from '@platon/feature/course/server'
import { ResourceFileService } from '@platon/feature/resource/server'
import { EntityManager } from 'typeorm'
import { SessionDataEntity } from './session-data.entity'
import { SessionEntity } from './session.entity'
import { SessionService } from './session.service'

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}))

const fsMock = require('fs').promises as {
  access: jest.Mock
  mkdir: jest.Mock
  writeFile: jest.Mock
}

describe('SessionService', () => {
  let service: SessionService
  let repository: MockRepository<SessionEntity>
  let repositoryData: MockRepository<SessionDataEntity> & { query: jest.Mock }
  let resourceFileService: jest.Mocked<Pick<ResourceFileService, 'getFileContent'>>
  let activityService: jest.Mocked<Pick<ActivityService, 'updateActivitiesDates'>>

  beforeEach(async () => {
    repository = mockRepository<SessionEntity>()
    repositoryData = { ...mockRepository<SessionDataEntity>(), query: jest.fn() }
    resourceFileService = { getFileContent: jest.fn() }
    activityService = { updateActivitiesDates: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getRepositoryToken(SessionEntity), useValue: repository },
        { provide: getRepositoryToken(SessionDataEntity), useValue: repositoryData },
        { provide: ResourceFileService, useValue: resourceFileService },
        { provide: ActivityService, useValue: activityService },
      ],
    }).compile()

    service = module.get(SessionService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it("devrait mettre à jour les dates d'activité et les settings puis retourner la session", async () => {
      const session = {
        activity: { source: { variables: { settings: { foo: 'bar' } } } },
        variables: { settings: {} },
      } as unknown as SessionEntity
      repository.findOne.mockResolvedValue(session)

      const result = await service.findById('session-1', {})

      expect(activityService.updateActivitiesDates).toHaveBeenCalledWith([session.activity])
      expect((session.variables as { settings: unknown }).settings).toEqual({ foo: 'bar' })
      expect(result).toBe(session)
    })

    it('devrait gérer une session nulle sans planter', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await service.findById('session-1', {})

      expect(activityService.updateActivitiesDates).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('devrait remonter récursivement au parent pour les settings', async () => {
      const parent = { activity: { source: { variables: { settings: { foo: 'from-parent' } } } } }
      const session = {
        activity: null,
        variables: {},
        parent,
      } as unknown as SessionEntity

      repository.findOne.mockResolvedValue(session)

      await service.findById('session-1', {})

      expect((parent as unknown as { variables: { settings: unknown } }).variables).toBeUndefined()
    })
  })

  describe('findAllWithParent', () => {
    it('devrait déléguer au repository avec le parentId', async () => {
      repository.find.mockResolvedValue([])

      await service.findAllWithParent('parent-1')

      expect(repository.find).toHaveBeenCalledWith({ where: { parentId: 'parent-1' } })
    })
  })

  describe('findUserActivity', () => {
    it('devrait attendre la session avant de mettre à jour les dates/settings', async () => {
      const session = {
        activity: { source: { variables: { settings: { foo: 'bar' } } } },
        variables: { settings: {} },
      } as unknown as SessionEntity
      repository.findOne.mockResolvedValue(session)

      const result = await service.findUserActivity('activity-1', 'user-1')

      expect(activityService.updateActivitiesDates).toHaveBeenCalledWith([session.activity])
      expect((session.variables as { settings: unknown }).settings).toEqual({ foo: 'bar' })
      expect(result).toBe(session)
    })
  })

  describe('findExerciseSessionById', () => {
    it('devrait retourner la session comme ExerciseSessionEntity', async () => {
      const session = { activity: null, variables: {} } as unknown as SessionEntity
      repository.findOne.mockResolvedValue(session)

      const result = await service.findExerciseSessionById('session-1')

      expect(result).toBe(session)
    })
  })

  describe('findExerciseSessionByActivityId', () => {
    it('devrait chercher par parentId et sessionId', async () => {
      repository.findOne.mockResolvedValue(null)

      await service.findExerciseSessionByActivityId('parent-1', 'session-1')

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { parentId: 'parent-1', id: 'session-1' },
        relations: undefined,
      })
    })
  })

  describe('create', () => {
    it('devrait sauvegarder via le repository sans entityManager', async () => {
      repository.create.mockReturnValue({ id: 'session-1' } as SessionEntity)
      repository.save.mockResolvedValue({ id: 'session-1' } as SessionEntity)

      const result = await service.create({ source: {} } as never)

      expect(repository.save).toHaveBeenCalled()
      expect(result).toEqual({ id: 'session-1' })
    })

    it("devrait sauvegarder via l'entityManager si fourni", async () => {
      const manager = {
        save: jest.fn().mockResolvedValue({ id: 'session-1' }),
        create: jest.fn().mockReturnValue({ id: 'session-1' }),
      } as unknown as EntityManager

      await service.create({ source: {} } as never, manager)

      expect(manager.save).toHaveBeenCalled()
      expect(repository.save).not.toHaveBeenCalled()
    })

    it('ne devrait pas copier une dépendance déjà présente sur le disque', async () => {
      fsMock.access.mockResolvedValue(undefined)
      repository.create.mockReturnValue({} as SessionEntity)
      repository.save.mockResolvedValue({} as SessionEntity)

      await service.create({
        source: {
          resource: 'res-1',
          dependencies: [{ hash: 'abc123', abspath: 'res-1:latest/file.txt' }],
        },
      } as never)

      expect(fsMock.writeFile).not.toHaveBeenCalled()
    })

    it('devrait copier une dépendance manquante sur le disque', async () => {
      fsMock.access.mockRejectedValue(new Error('not found'))
      fsMock.mkdir.mockResolvedValue(undefined)
      fsMock.writeFile.mockResolvedValue(undefined)
      resourceFileService.getFileContent.mockResolvedValue(new Uint8Array([1, 2, 3]))
      repository.create.mockReturnValue({} as SessionEntity)
      repository.save.mockResolvedValue({} as SessionEntity)

      await service.create({
        source: {
          resource: 'res-1',
          dependencies: [{ hash: 'abc123', abspath: 'res-1:latest/file.txt' }],
        },
      } as never)

      expect(fsMock.writeFile).toHaveBeenCalled()
    })

    it("ne devrait pas planter si l'écriture du fichier échoue", async () => {
      fsMock.access.mockRejectedValue(new Error('not found'))
      fsMock.mkdir.mockRejectedValue(new Error('boom'))
      repository.create.mockReturnValue({} as SessionEntity)
      repository.save.mockResolvedValue({} as SessionEntity)

      await expect(
        service.create({
          source: {
            resource: 'res-1',
            dependencies: [{ hash: 'abc123', abspath: 'res-1:latest/file.txt' }],
          },
        } as never)
      ).resolves.toBeDefined()
    })
  })

  describe('update', () => {
    it("devrait mettre à jour uniquement via l'entityManager quand fourni, sans doublon via le repository", async () => {
      const manager = { update: jest.fn().mockResolvedValue(undefined) } as unknown as EntityManager
      repositoryData.query.mockResolvedValue([])
      repositoryData.findBy.mockResolvedValue([])

      await service.update('session-1', { grade: 10 }, manager)

      expect(manager.update).toHaveBeenCalled()
      expect(repository.update).not.toHaveBeenCalled()
    })

    it('devrait mettre à jour via le repository sans entityManager', async () => {
      repositoryData.query.mockResolvedValue([])
      repositoryData.findBy.mockResolvedValue([])

      await service.update('session-1', { grade: 10 })

      expect(repository.update).toHaveBeenCalledWith({ id: 'session-1' }, { grade: 10 })
    })

    it("ne devrait rien synchroniser si aucune sessionData n'existe", async () => {
      repositoryData.query.mockResolvedValue([])
      repositoryData.findBy.mockResolvedValue([])

      await service.update('session-1', { grade: 10 })

      expect(repositoryData.save).not.toHaveBeenCalled()
    })

    it('devrait synchroniser les sessionData correspondantes', async () => {
      repositoryData.query.mockResolvedValue([
        {
          id: 'session-1',
          user_id: 'user-1',
          parent_id: null,
          grade: 10,
          attempts: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      const existingSessionData = { id: 'session-1' } as SessionDataEntity
      repositoryData.findBy.mockResolvedValue([existingSessionData])
      repositoryData.save.mockResolvedValue([existingSessionData] as never)

      await service.update('session-1', { grade: 10 })

      expect(repositoryData.save).toHaveBeenCalledWith([expect.objectContaining({ id: 'session-1', grade: 10 })])
    })

    it('ne devrait pas modifier une sessionData sans correspondance dans les nouvelles valeurs', async () => {
      repositoryData.query.mockResolvedValue([{ id: 'other-session' }])
      const existingSessionData = { id: 'session-1', grade: -1 } as SessionDataEntity
      repositoryData.findBy.mockResolvedValue([existingSessionData])
      repositoryData.save.mockResolvedValue([existingSessionData] as never)

      await service.update('session-1', { grade: 10 })

      expect(existingSessionData.grade).toBe(-1)
    })
  })

  describe('retrieveSessionDataWithoutManager', () => {
    it('devrait retourner un tableau vide sans résultat', async () => {
      repositoryData.query.mockResolvedValue([])

      const result = await service.retrieveSessionDataWithoutManager('session-1')

      expect(result).toEqual([])
    })

    it('devrait mapper les colonnes snake_case vers les champs camelCase', async () => {
      repositoryData.query.mockResolvedValue([
        {
          id: 'session-1',
          user_id: 'user-1',
          parent_id: null,
          grade: 10,
          attempts: 1,
          resource_id: 'res-1',
          resource_type: 'exercise',
          resource_name: 'Exercise',
          correction_enabled: true,
        },
      ])

      const [result] = await service.retrieveSessionDataWithoutManager('session-1')

      expect(result.userId).toBe('user-1')
      expect(result.resourceId).toBe('res-1')
      expect(result.correctionEnabled).toBe(true)
    })
  })

  describe('onReopenActivity', () => {
    it("devrait mettre à jour les sessions racine terminées de l'activité", async () => {
      const qb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      }
      repository.createQueryBuilder.mockReturnValue(qb as never)

      await service.onReopenActivity({ activityId: 'activity-1' })

      expect(qb.set).toHaveBeenCalledWith(expect.objectContaining({ terminatedAt: null }))
      expect(qb.where).toHaveBeenCalledWith('activity_id = :activityId and parent_id is null', {
        activityId: 'activity-1',
      })
    })
  })

  describe('onCloseActivity', () => {
    it('devrait marquer les sessions racines comme terminées', async () => {
      const qb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      }
      repository.createQueryBuilder.mockReturnValue(qb as never)

      await service.onCloseActivity({ activityId: 'activity-1' })

      expect(qb.execute).toHaveBeenCalled()
    })
  })
})
