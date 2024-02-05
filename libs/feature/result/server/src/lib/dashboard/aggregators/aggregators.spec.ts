import { AnswerStates, answerStateFromGrade } from '@platon/feature/result/common'
import { SessionView } from '../../sessions/session.view'
import { DEFAULT_GAP_DURATION, answerStateFromSession, sessionDurationInSeconds } from './aggregators'

describe('aggregators', () => {
  describe('sessionDurationInSeconds', () => {
    it('should return 0 if answers array is empty', () => {
      const input = {
        answers: [],
        startedAt: new Date(),
        lastGradedAt: new Date(),
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(0)
    })

    it('should return 0 if startedAt is not defined', () => {
      const input = {
        answers: [{ createdAt: new Date() }],
        startedAt: undefined,
        lastGradedAt: new Date(),
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(0)
    })

    it('should return 0 if lastGradedAt is not defined', () => {
      const input = {
        answers: [{ createdAt: new Date() }],
        startedAt: new Date(),
        lastGradedAt: undefined,
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(0)
    })

    it('should calculate the correct duration when answers array has one element', () => {
      const startedAt = new Date(2023, 0, 1, 10, 0, 0)
      const lastGradedAt = new Date(2023, 0, 1, 10, 0, 10)
      const input = {
        parentId: 'activityId',
        answers: [{ createdAt: new Date(2023, 0, 1, 10, 0, 5) }],
        startedAt,
        lastGradedAt,
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(5)
    })

    it('should calculate the correct duration when answers array has multiple elements', () => {
      const startedAt = new Date(2023, 0, 1, 10, 0, 0)
      const lastGradedAt = new Date(2023, 0, 1, 10, 0, 20)
      const input = {
        parentId: 'activityId',
        answers: [
          { createdAt: new Date(2023, 0, 1, 10, 0, 5) },
          { createdAt: new Date(2023, 0, 1, 10, 0, 10) },
          { createdAt: new Date(2023, 0, 1, 10, 0, 15) },
        ],
        startedAt,
        lastGradedAt,
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(15)
    })

    it('should handle activity session correctly', () => {
      const startedAt = new Date(2023, 0, 1, 10, 0, 0)
      const lastGradedAt = new Date(2023, 0, 1, 10, 0, 20)
      const input = {
        startedAt,
        lastGradedAt,
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(20)
    })

    it('should handle MAX_GAP_DURATION correctly', () => {
      const startedAt = new Date(2023, 0, 1, 10, 0, 0)
      const lastGradedAt = new Date(2023, 0, 1, 10, 0, 30)
      const input = {
        parentId: 'activityId',
        answers: [
          { createdAt: new Date(2023, 0, 1, 10, 0, 5) },
          { createdAt: new Date(2023, 0, 1, 10, 0, 10) },
          { createdAt: new Date(2023, 0, 2, 10, 0, 30) },
        ],
        startedAt,
        lastGradedAt,
      } as unknown as SessionView

      const result = sessionDurationInSeconds(input)

      expect(result).toBe(10 + DEFAULT_GAP_DURATION)
    })
  })

  describe('answerStateFromSession', () => {
    it('should return AnswerStates.STARTED if session has startedAt and no attempts', () => {
      const session = {
        startedAt: new Date(),
        attempts: 0,
      } as unknown as SessionView

      const result = answerStateFromSession(session)

      expect(result).toBe(AnswerStates.STARTED)
    })

    it('should return AnswerStates.NOT_STARTED if session does not have startedAt', () => {
      const session = {
        attempts: 0,
      } as unknown as SessionView

      const result = answerStateFromSession(session)

      expect(result).toBe(AnswerStates.NOT_STARTED)
    })

    it('should return the correct answer state when session has correctionGrade', () => {
      const session = {
        startedAt: new Date(),
        attempts: 1,
        grade: 50,
        correctionGrade: 100,
      } as unknown as SessionView

      const result = answerStateFromSession(session)

      expect(result).toBe(answerStateFromGrade(100))
    })

    it('should return the correct answer state when session has grade', () => {
      const session = {
        startedAt: new Date(),
        attempts: 1,
        grade: 50,
      } as unknown as SessionView

      const result = answerStateFromSession(session)
      expect(result).toBe(answerStateFromGrade(50))
    })
  })
})
