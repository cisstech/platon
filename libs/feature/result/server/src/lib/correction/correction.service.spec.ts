import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { mockRepository, MockRepository } from '@platon/core/testing/server'
import { NotFoundResponse } from '@platon/core/common'
import { EventService } from '@platon/core/server'
import { ON_CORRECT_ACTIVITY_EVENT } from '@platon/feature/course/server'
import { CorrectionStatus } from '@platon/feature/result/common'
import { SessionEntity } from '../sessions/session.entity'
import { CorrectionEntity } from './correction.entity'
import { CorrectionService } from './correction.service'

describe('CorrectionService', () => {
  let service: CorrectionService
  let sessionRepository: MockRepository<SessionEntity> & { query: jest.Mock }
  let correctionRepository: MockRepository<CorrectionEntity>
  let eventService: { emit: jest.Mock }

  const baseProjection = {
    userId: 'user-1',
    activityId: 'activity-1',
    activityName: 'Activity 1',
    exerciseId: 'exercise-1',
    activitySessionId: 'activity-session-1',
    exerciseSessionId: 'exercise-session-1',
    courseId: 'course-1',
    courseName: 'Course 1',
    exerciseName: 'Exercise 1',
    hasUploads: false,
    labels: [],
  }

  beforeEach(async () => {
    sessionRepository = {
      ...mockRepository<SessionEntity>(),
      query: jest.fn().mockResolvedValue([baseProjection]),
    }
    correctionRepository = mockRepository<CorrectionEntity>()
    eventService = { emit: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorrectionService,
        { provide: EventService, useValue: eventService },
        { provide: getRepositoryToken(SessionEntity), useValue: sessionRepository },
        { provide: getRepositoryToken(CorrectionEntity), useValue: correctionRepository },
      ],
    }).compile()

    service = module.get(CorrectionService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('list', () => {
    it('should LEFT JOIN answers (not INNER) so a session with zero submitted answers is still listed', async () => {
      await service.list('corrector-1')

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).toContain('LEFT JOIN LATERAL')
      expect(queryText).not.toContain('INNER JOIN LATERAL')
    })

    it('should keep sessions with no answer as long as the session itself recorded a grader error', async () => {
      await service.list('corrector-1')

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).toContain(
        `(answer.variables IS NOT NULL OR (exercise_session.variables->'.meta'->>'error')::boolean IS TRUE)`
      )
    })

    it('should not join or filter on answers at all in viewer mode', async () => {
      await service.list('corrector-1', undefined, true)

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).not.toContain('"Answers" a')
      expect(queryText).not.toContain('answer.variables')
    })

    it('should group exercises of the same activity together', async () => {
      sessionRepository.query.mockResolvedValue([
        baseProjection,
        { ...baseProjection, exerciseSessionId: 'exercise-session-2', userId: 'user-2' },
      ])

      const result = await service.list('corrector-1')

      expect(result).toHaveLength(1)
      expect(result[0].exercises).toHaveLength(2)
    })

    it('should only return activities with at least one uncorrected exercise when status=pending', async () => {
      sessionRepository.query.mockResolvedValue([
        { ...baseProjection, activityId: 'activity-pending', correctedBy: undefined },
        {
          ...baseProjection,
          activityId: 'activity-done',
          exerciseSessionId: 'exercise-session-2',
          correctedBy: 'teacher-1',
        },
      ])

      const result = await service.list('corrector-1', undefined, false, CorrectionStatus.pending)

      expect(result.map((activity) => activity.activityId)).toEqual(['activity-pending'])
    })

    it('should only return fully corrected activities when status=available', async () => {
      sessionRepository.query.mockResolvedValue([
        { ...baseProjection, activityId: 'activity-pending', correctedBy: undefined },
        {
          ...baseProjection,
          activityId: 'activity-done',
          exerciseSessionId: 'exercise-session-2',
          correctedBy: 'teacher-1',
        },
      ])

      const result = await service.list('corrector-1', undefined, false, CorrectionStatus.available)

      expect(result.map((activity) => activity.activityId)).toEqual(['activity-done'])
    })
  })

  describe('listSummary', () => {
    it('devrait ajouter une clause HAVING pour ne garder que les activités en attente', async () => {
      await service.listSummary('corrector-1', CorrectionStatus.pending)

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).toContain('HAVING SUM(copy.total) > SUM(copy.corrected)')
    })

    it('devrait ajouter une clause HAVING pour ne garder que les activités entièrement corrigées', async () => {
      await service.listSummary('corrector-1', CorrectionStatus.available)

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).toContain('HAVING SUM(copy.total) = SUM(copy.corrected)')
    })

    it('ne devrait ajouter aucune clause HAVING sans statut', async () => {
      await service.listSummary('corrector-1')

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).not.toContain('HAVING')
    })

    it('devrait compter les mêmes exercices que la file de correction', async () => {
      await service.listSummary('corrector-1')

      const [queryText] = sessionRepository.query.mock.calls[0]
      expect(queryText).toContain(`(exercise_session.variables->'.meta'->>'error')::boolean IS TRUE`)
      expect(queryText).toContain('FROM "Resources" r')
      expect(queryText).not.toContain('DISTINCT ts.id')
    })

    it('devrait retourner le résultat brut de la requête', async () => {
      const rows = [{ activityId: 'a1', totalExercises: 3, correctedExercises: 1 }]
      sessionRepository.query.mockResolvedValue(rows)

      await expect(service.listSummary('corrector-1')).resolves.toBe(rows)
    })
  })

  describe('upsert', () => {
    it("devrait lever une NotFoundResponse si la session n'existe pas", async () => {
      sessionRepository.findOne.mockResolvedValue(null)

      await expect(service.upsert('session-1', {})).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait lever une NotFoundResponse si la session n'a pas de session parente", async () => {
      sessionRepository.findOne.mockResolvedValue({ id: 'session-1', parent: null } as never)

      await expect(service.upsert('session-1', {})).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait fusionner dans la correction existante plutôt que d'en créer une nouvelle", async () => {
      const existingCorrection = { id: 'correction-1', grade: 5 } as CorrectionEntity
      sessionRepository.findOne.mockResolvedValue({
        id: 'session-1',
        correction: existingCorrection,
        parent: { id: 'parent-1' },
      } as never)
      sessionRepository.find.mockResolvedValue([])
      correctionRepository.save.mockImplementation(async (c) => c as CorrectionEntity)

      await service.upsert('session-1', { grade: 8 })

      expect(correctionRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'correction-1', grade: 8 }))
      expect(correctionRepository.create).not.toHaveBeenCalled()
    })

    it("devrait créer une nouvelle correction et lier la session si aucune n'existe", async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'session-1',
        correction: null,
        parent: { id: 'parent-1' },
      } as never)
      sessionRepository.find.mockResolvedValue([])
      correctionRepository.save.mockResolvedValue({ id: 'new-correction', grade: 8 } as CorrectionEntity)

      const result = await service.upsert('session-1', { grade: 8 })

      expect(sessionRepository.update).toHaveBeenCalledWith('session-1', { correctionId: 'new-correction' })
      expect(result.id).toBe('new-correction')
    })

    it("ne devrait pas terminer l'activité tant que tous les exercices ne sont pas corrigés", async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'session-1',
        correction: { id: 'c1', grade: 5 },
        parent: { id: 'parent-1' },
      } as never)
      sessionRepository.find.mockResolvedValue([{ correction: { grade: 5 } }, { correction: null }] as never)
      correctionRepository.save.mockResolvedValue({ id: 'c1', grade: 8 } as CorrectionEntity)

      await service.upsert('session-1', { grade: 8 })

      expect(sessionRepository.save).not.toHaveBeenCalled()
      expect(eventService.emit).not.toHaveBeenCalled()
    })

    it("devrait calculer la moyenne, sauvegarder la session d'activité et émettre l'événement quand tous les exercices sont corrigés", async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'session-1',
        correction: { id: 'c1', grade: 5 },
        parent: { id: 'parent-1' },
        activity: { id: 'activity-1' },
        userId: 'user-1',
      } as never)
      sessionRepository.find.mockResolvedValue([{ correction: { grade: 6 } }, { correction: { grade: 10 } }] as never)
      correctionRepository.save.mockResolvedValue({ id: 'c1', grade: 8 } as CorrectionEntity)
      sessionRepository.save.mockImplementation(async (s) => s as SessionEntity)

      await service.upsert('session-1', { grade: 8 })

      expect(sessionRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'parent-1', grade: 8 }))
      expect(eventService.emit).toHaveBeenCalledWith(ON_CORRECT_ACTIVITY_EVENT, {
        userId: 'user-1',
        activity: { id: 'activity-1' },
      })
    })

    it("ne devrait pas émettre d'événement si la session n'a pas d'activité/userId associés", async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'session-1',
        correction: { id: 'c1', grade: 5 },
        parent: { id: 'parent-1' },
        activity: undefined,
        userId: undefined,
      } as never)
      sessionRepository.find.mockResolvedValue([{ correction: { grade: 5 } }] as never)
      correctionRepository.save.mockResolvedValue({ id: 'c1', grade: 5 } as CorrectionEntity)

      await service.upsert('session-1', {})

      expect(eventService.emit).not.toHaveBeenCalled()
    })
  })
})
