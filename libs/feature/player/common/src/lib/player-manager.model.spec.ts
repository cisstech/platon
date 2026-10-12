/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenResponse, User, UserRoles } from '@platon/core/common'
import { ExerciseSession, Session } from '@platon/feature/result/common'
import { PlayerManager } from './player-manager.model'
import { SandboxManager } from './sandbox-manager.model'

const createNavigation = (overrides: Record<string, unknown> = {}) => ({
  started: true,
  terminated: false,
  exercises: [],
  nextExercisesHistory: [],
  nextExercisesHistoryPosition: -1,
  current: null,
  ...overrides,
})

const createActivitySession = (overrides: Partial<Session> = {}): Session =>
  ({
    id: 'activity-session-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: null,
    parentId: null,
    userId: 'user-id',
    activity: { id: 'activity-id', code: 'ABC123', closeAt: null } as any,
    activityId: 'activity-id',
    variables: {
      navigation: createNavigation(),
      settings: {},
    },
    grade: -1,
    attempts: 0,
    startedAt: null,
    source: {} as any,
    isBuilt: true,
    ...overrides,
  } as Session)

const createExerciseSession = (overrides: Partial<ExerciseSession> = {}): ExerciseSession =>
  ({
    id: 'exercise-session-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: createActivitySession(),
    parentId: 'activity-session-id',
    userId: 'user-id',
    activity: null,
    activityId: null,
    variables: {},
    grade: -1,
    attempts: 0,
    startedAt: null,
    source: {} as any,
    isBuilt: true,
    ...overrides,
  } as ExerciseSession)

class TestPlayerManager extends PlayerManager {
  updateSession = jest.fn().mockResolvedValue(undefined)
  createAnswer = jest.fn()
  findGrades = jest.fn().mockResolvedValue([])
  findSessionById = jest.fn()
  findSessionsByParentId = jest.fn().mockResolvedValue([])
  findExerciseSessionById = jest.fn()
  notifyExerciseChanges = jest.fn().mockResolvedValue(undefined)
  notifyModerationActivityChanges = jest.fn().mockResolvedValue(undefined)
  nextPeerExercise = jest.fn()
}

describe('PlayerManager', () => {
  let manager: TestPlayerManager

  beforeEach(() => {
    manager = new TestPlayerManager({} as SandboxManager)
    jest.clearAllMocks()
  })

  describe('openSessionWithCode', () => {
    it('rejette si la session est introuvable', async () => {
      manager.findSessionById.mockResolvedValue(null)

      await expect(manager.openSessionWithCode('unknown-id', 'ABC123')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("rejette si le code ne correspond pas au code de l'activité", async () => {
      manager.findSessionById.mockResolvedValue(createActivitySession())

      await expect(manager.openSessionWithCode('session-id', 'WRONG1')).rejects.toBeInstanceOf(ForbiddenResponse)
      expect(manager.updateSession).not.toHaveBeenCalled()
    })

    it('accepte le bon code et rouvre une session terminée (remet terminated à false)', async () => {
      const session = createActivitySession({
        variables: { navigation: createNavigation({ terminated: true }), settings: {} },
      })
      manager.findSessionById.mockResolvedValue(session)

      const result = await manager.openSessionWithCode('session-id', 'ABC123')

      expect(result.activity.navigation.terminated).toBe(false)
      expect(manager.updateSession).toHaveBeenCalledWith(
        'activity-session-id',
        expect.objectContaining({ variables: expect.objectContaining({ navigation: expect.anything() }) })
      )
    })

    it("ne réécrit rien si la session n'était pas terminée (retour anticipé)", async () => {
      const session = createActivitySession({
        variables: { navigation: createNavigation({ terminated: false }), settings: {} },
      })
      manager.findSessionById.mockResolvedValue(session)

      await manager.openSessionWithCode('session-id', 'ABC123')

      expect(manager.updateSession).not.toHaveBeenCalled()
    })

    it('notifie la modération quand un userId est présent sur la session', async () => {
      const session = createActivitySession({
        userId: 'student-id',
        variables: { navigation: createNavigation({ terminated: true }), settings: {} },
      })
      manager.findSessionById.mockResolvedValue(session)

      await manager.openSessionWithCode('session-id', 'ABC123')

      expect(manager.notifyModerationActivityChanges).toHaveBeenCalledWith('student-id', expect.anything())
    })

    it("ne notifie pas la modération quand aucun userId n'est présent (session de test)", async () => {
      const session = createActivitySession({
        userId: null,
        variables: { navigation: createNavigation({ terminated: true }), settings: {} },
      })
      manager.findSessionById.mockResolvedValue(session)

      await manager.openSessionWithCode('session-id', 'ABC123')

      expect(manager.notifyModerationActivityChanges).not.toHaveBeenCalled()
    })

    // Test de non-régression : avant correction, isExpired() lisait `session.parent.variables.settings.duration`,
    // ce qui ne fonctionnait jamais quand on lui passait directement la session racine (sans parent),
    // permettant à un étudiant de rentrer avec le code même après expiration de la durée du TP noté.
    it("rejette avec le bon code si la durée de l'activité est dépassée (session racine, sans parent)", async () => {
      const duration = 60 // secondes
      const session = createActivitySession({
        parent: null,
        startedAt: new Date(Date.now() - duration * 2 * 1000),
        variables: { navigation: createNavigation({ terminated: true }), settings: { duration } },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSessionWithCode('session-id', 'ABC123')).rejects.toBeInstanceOf(ForbiddenResponse)
      expect(manager.updateSession).not.toHaveBeenCalled()
    })

    it("n'est pas expirée tant que la durée n'est pas dépassée", async () => {
      const duration = 3600
      const session = createActivitySession({
        startedAt: new Date(Date.now() - 60 * 1000),
        variables: { navigation: createNavigation({ terminated: true }), settings: { duration } },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSessionWithCode('session-id', 'ABC123')).resolves.toBeDefined()
    })

    it("rejette si closeAt de l'activité est dépassé", async () => {
      const session = createActivitySession({
        activity: { id: 'activity-id', code: 'ABC123', closeAt: new Date(Date.now() - 60 * 1000) } as any,
        variables: { navigation: createNavigation({ terminated: true }), settings: {} },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSessionWithCode('session-id', 'ABC123')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    // Test de non-régression : la durée et closeAt doivent s'appliquer indépendamment (OU logique).
    // Avant correction, `closeAt` (s'il était défini) écrasait systématiquement la date d'expiration
    // calculée à partir de `duration`, permettant de continuer à répondre bien après le temps fixé par `duration`
    // accordées, tant que la fenêtre globale de l'activité (closeAt) n'était pas elle-même dépassée.
    it("rejette si la durée est dépassée même si closeAt de l'activité n'est pas encore atteint", async () => {
      const duration = 120 // 2 minutes, comme dans le cas réel observé en production
      const session = createActivitySession({
        startedAt: new Date(Date.now() - duration * 2 * 1000), // 4 minutes écoulées
        activity: { id: 'activity-id', code: 'ABC123', closeAt: new Date(Date.now() + 3600 * 1000) } as any, // clôture dans 1h
        variables: { navigation: createNavigation({ terminated: true }), settings: { duration } },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSessionWithCode('session-id', 'ABC123')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("rejette si closeAt est dépassé même si la durée par tentative n'est pas encore atteinte", async () => {
      const duration = 3600 // 1h par tentative, largement pas atteinte
      const session = createActivitySession({
        startedAt: new Date(Date.now() - 60 * 1000), // commencée il y a 1 minute
        activity: { id: 'activity-id', code: 'ABC123', closeAt: new Date(Date.now() - 60 * 1000) } as any, // fenêtre déjà fermée
        variables: { navigation: createNavigation({ terminated: true }), settings: { duration } },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSessionWithCode('session-id', 'ABC123')).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })

  describe('date de fin de la copie', () => {
    it('date la copie quand elle est terminée', async () => {
      manager.findSessionById.mockResolvedValue(createActivitySession())

      await manager.terminate('session-id', { id: 'user-id', role: UserRoles.student } as User)

      expect(manager.updateSession).toHaveBeenCalledWith(
        'activity-session-id',
        expect.objectContaining({ terminatedAt: expect.any(Date) })
      )
    })

    it('efface la date quand la copie est rouverte, avec ou sans code', async () => {
      const terminated = () =>
        createActivitySession({ variables: { navigation: createNavigation({ terminated: true }), settings: {} } })
      manager.findSessionById.mockResolvedValueOnce(terminated()).mockResolvedValueOnce(terminated())

      await manager.openSession('session-id')
      await manager.openSessionWithCode('session-id', 'ABC123')

      expect(manager.updateSession).toHaveBeenCalledTimes(2)
      expect(manager.updateSession).toHaveBeenNthCalledWith(
        1,
        'activity-session-id',
        expect.objectContaining({ terminatedAt: null })
      )
      expect(manager.updateSession).toHaveBeenNthCalledWith(
        2,
        'activity-session-id',
        expect.objectContaining({ terminatedAt: null })
      )
    })
  })

  describe('openSession (sans code)', () => {
    it("rejette également si la durée de l'activité est dépassée (même régression que openSessionWithCode)", async () => {
      const duration = 60
      const session = createActivitySession({
        startedAt: new Date(Date.now() - duration * 2 * 1000),
        variables: { navigation: createNavigation({ terminated: true }), settings: { duration } },
      })
      manager.findSessionById.mockResolvedValue(session)

      await expect(manager.openSession('session-id')).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })

  describe('evaluate / saveTemporaryAnswer (session enfant avec parent)', () => {
    it("evaluate rejette quand la durée de l'activité parente est dépassée", async () => {
      const duration = 60
      const exerciseSession = createExerciseSession({
        userId: null,
        startedAt: new Date(Date.now() - duration * 2 * 1000),
        parent: createActivitySession({
          startedAt: new Date(Date.now() - duration * 2 * 1000),
          variables: { navigation: createNavigation(), settings: { duration } },
        }),
      })
      manager.findExerciseSessionById.mockResolvedValue(exerciseSession)

      await expect(
        manager.evaluate({ sessionId: 'exercise-session-id', action: 'SAVE_ANSWER' } as any)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("saveTemporaryAnswer rejette quand la durée de l'activité parente est dépassée", async () => {
      const duration = 60
      const exerciseSession = createExerciseSession({
        userId: null,
        startedAt: new Date(Date.now() - duration * 2 * 1000),
        parent: createActivitySession({
          startedAt: new Date(Date.now() - duration * 2 * 1000),
          variables: { navigation: createNavigation(), settings: { duration } },
        }),
      })
      manager.findExerciseSessionById.mockResolvedValue(exerciseSession)

      await expect(
        manager.saveTemporaryAnswer({ sessionId: 'exercise-session-id', action: 'SAVE_ANSWER' } as any)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("evaluate n'est pas bloqué tant que la durée n'est pas dépassée", async () => {
      const duration = 3600
      const exerciseSession = createExerciseSession({
        userId: null,
        startedAt: new Date(Date.now() - 60 * 1000),
        variables: { answers: {}, '.meta': { grades: [], totalAttempts: 0 } } as any,
        parent: createActivitySession({
          startedAt: new Date(Date.now() - 60 * 1000),
          variables: { navigation: createNavigation(), settings: { duration } },
        }),
      })
      manager.findExerciseSessionById.mockResolvedValue(exerciseSession)

      await expect(
        manager.evaluate({ sessionId: 'exercise-session-id', action: 'SAVE_ANSWER' } as any)
      ).resolves.toBeDefined()
    })

    // Test de non-régression : reproduit exactement le bug trouvé en production. La durée est une
    // limite pour l'ACTIVITÉ entière, mesurée depuis son propre démarrage (parent.startedAt), pas
    // depuis le démarrage de CET exercice. Avant correction, isExpired lisait `session.startedAt`
    // (celui de l'exercice) : ouvrir un exercice jamais visité relançait le chrono indéfiniment,
    // même bien après l'expiration réelle de l'activité.
    it("evaluate rejette même si CET exercice vient d'être ouvert pour la première fois, dès lors que l'activité parente a dépassé sa durée", async () => {
      const duration = 30
      const exerciseSession = createExerciseSession({
        userId: null,
        startedAt: new Date(), // cet exercice vient tout juste d'être ouvert pour la première fois
        variables: { answers: {}, '.meta': { grades: [], totalAttempts: 0 } } as any,
        parent: createActivitySession({
          startedAt: new Date(Date.now() - 300 * 1000), // l'activité, elle, a démarré il y a 5 minutes
          variables: { navigation: createNavigation(), settings: { duration } },
        }),
      })
      manager.findExerciseSessionById.mockResolvedValue(exerciseSession)

      await expect(
        manager.evaluate({ sessionId: 'exercise-session-id', action: 'SAVE_ANSWER' } as any)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })
  })
})
