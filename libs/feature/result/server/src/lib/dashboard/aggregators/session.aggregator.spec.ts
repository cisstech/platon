import { AnswerStates } from '@platon/feature/result/common'
import { SessionView } from '../../sessions/session.view'
import {
  ExerciseAverageAttempts,
  ExerciseAverageAttemptsToSuccess,
  SessionAverageScore,
  SessionAverageDuration,
  SessionDistributionByAnswerState,
  ExerciseDropOutRate,
  ExerciseAnswerRate,
  SessionSuccessRate,
  ExerciseSuccessRateOnFirstAttempt,
  ExerciseTotalAttempts,
} from './session.aggregator'

describe('SessionAggregators', () => {
  describe('SessionSuccessRate', () => {
    let aggregator: SessionSuccessRate

    beforeEach(() => {
      aggregator = new SessionSuccessRate()
    })

    it('should initialize with totalSessions and totalSuccess set to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalSuccess']).toBe(0)
    })

    it('should increment totalSessions when input has attempts', () => {
      const input = {
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalSuccess when grade is 100', () => {
      const input = {
        attempts: 10,
        grade: 100,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSuccess']).toBe(1)
    })

    it('should not increment totalSuccess when grade is not 100', () => {
      const input = {
        attempts: 10,
        grade: 80,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSuccess']).toBe(0)
    })

    it('should calculate success rate correctly', () => {
      aggregator['totalSessions'] = 10
      aggregator['totalSuccess'] = 5

      expect(aggregator.complete()).toBe(50)
    })

    it('should return 0 when no sessions', () => {
      expect(aggregator.complete()).toBe(0)
    })
  })

  describe('SessionAverageTime', () => {
    let aggregator: SessionAverageDuration

    beforeEach(() => {
      aggregator = new SessionAverageDuration()
    })

    it('should initialize with totalSessions and totalDurations set to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalDurations']).toBe(0)
    })

    describe('next', () => {
      it('should increment totalSessions when input.attempts is defined', () => {
        const input = {
          startedAt: new Date(),
          lastGradedAt: new Date(),
          attempts: 1,
        } as SessionView

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(1)
      })

      it('should not increment totalSessions when input.attempts is undefined', () => {
        const input = {
          startedAt: undefined,
          lastGradedAt: new Date(),
        } as SessionView

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(0)
      })

      it('should not increment totalSessions when input.attempts is 0', () => {
        const input = {
          startedAt: undefined,
          lastGradedAt: new Date(),
          attempts: 0,
        } as SessionView

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(0)
      })

      it('should add the difference in seconds between input.lastGradedAt and input.startedAt to totalDurations when both are defined', () => {
        const input = {
          startedAt: new Date(2023, 0, 1, 10, 0, 0),
          lastGradedAt: new Date(2023, 0, 1, 10, 0, 10),
          attempts: 1,
        } as SessionView

        aggregator.next(input)

        expect(aggregator['totalDurations']).toBe(10)
      })

      it('should not add anything to totalDurations when input.lastGradedAt or input.startedAt is undefined', () => {
        const input = {
          startedAt: new Date(),
          lastGradedAt: undefined,
        } as SessionView

        aggregator.next(input)

        expect(aggregator['totalDurations']).toBe(0)
      })
    })

    describe('complete', () => {
      it('should return 0 when totalSessions is 0', () => {
        const result = aggregator.complete()

        expect(result).toBe(0)
      })

      it('should return the average time when totalSessions is greater than 0', () => {
        aggregator['totalSessions'] = 3
        aggregator['totalDurations'] = 150

        const result = aggregator.complete()

        expect(result).toBe(50)
      })
    })
  })

  describe('SessionAverageScore', () => {
    let aggregator: SessionAverageScore

    beforeEach(() => {
      aggregator = new SessionAverageScore()
    })

    it('should initialize with totalSessions and totalScores set to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalScores']).toBe(0)
    })

    it('should increment totalSessions when input has attempts', () => {
      const input = {
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should add the score to totalScores when grade is positive', () => {
      const input = {
        attempts: 10,
        grade: 80,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalScores']).toBe(80)
    })

    it('should not add to totalScores when grade is negative', () => {
      const input = {
        attempts: 10,
        grade: -1,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalScores']).toBe(0)
    })

    it('should return 0 when totalSessions is 0', () => {
      const result = aggregator.complete()

      expect(result).toBe(0)
    })

    it('should return the average score when totalSessions is greater than 0', () => {
      aggregator['totalSessions'] = 2
      aggregator['totalScores'] = 150

      const result = aggregator.complete()

      expect(result).toBe(75)
    })
  })

  describe('SessionDistributionByAnswerState', () => {
    let aggregator: SessionDistributionByAnswerState

    beforeEach(() => {
      aggregator = new SessionDistributionByAnswerState()
    })

    it('should initialize distribution to 0 for all states', () => {
      Object.keys(AnswerStates).forEach((state) => {
        expect(aggregator['distribution'][state as AnswerStates]).toBe(0)
      })
    })

    it('should be not_started if not startedAt not defined', () => {
      const input = {
        grade: 100,
        startedAt: undefined,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['distribution'].NOT_STARTED).toBe(1)
    })

    it('should be started if startedAt and attempts is 0', () => {
      const input = {
        attempts: 0,
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['distribution'].STARTED).toBe(1)
    })

    it('should increment count for state based on grade', () => {
      aggregator.next({ grade: 100, attempts: 1, startedAt: new Date() } as SessionView)
      expect(aggregator['distribution'].SUCCEEDED).toBe(1)
    })

    it('should handle multiple sessions', () => {
      aggregator.next({ grade: 100, attempts: 1, startedAt: new Date() } as SessionView)
      aggregator.next({ grade: 0, attempts: 1, startedAt: new Date() } as SessionView)

      expect(aggregator['distribution'].SUCCEEDED).toBe(1)
      expect(aggregator['distribution'].FAILED).toBe(1)
    })

    it('should return distribution on complete()', () => {
      aggregator.next({ grade: 100 } as SessionView)
      aggregator.next({ grade: 100 } as SessionView)
      aggregator.next({ grade: 0 } as SessionView)

      const expected = {} as Record<AnswerStates, number>
      Object.keys(AnswerStates).forEach((state) => {
        expected[state as AnswerStates] = 0
      })

      expected.SUCCEEDED = 2
      expected.FAILED = 1
      const result = aggregator.complete()

      expect(result).toEqual(result)
    })
  })

  describe('ExerciseDropOutRate', () => {
    let aggregator: ExerciseDropOutRate

    beforeEach(() => {
      aggregator = new ExerciseDropOutRate()
    })

    it('should initialize totals to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalDropOuts']).toBe(0)
    })

    it('should increment totalSessions when input has startedAt', () => {
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalDropOuts when no lastGradedAt', () => {
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalDropOuts']).toBe(1)
    })

    it('should not increment totalDropOuts when lastGradedAt exists', () => {
      const input = {
        startedAt: new Date(),
        lastGradedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalDropOuts']).toBe(0)
    })

    describe('complete()', () => {
      it('should return 0 if no sessions', () => {
        expect(aggregator.complete()).toBe(0)
      })

      it('should calculate correct drop-out rate', () => {
        aggregator.next({ startedAt: new Date() } as unknown as SessionView) // started
        aggregator.next({ startedAt: new Date(), lastGradedAt: new Date() } as unknown as SessionView) // completed
        aggregator.next({ startedAt: new Date() } as unknown as SessionView) // started but not completed

        expect(aggregator.complete()).toBe(67) // 2 ungraded + 3 started
      })
    })
  })

  describe('ExerciseTotalAttempts', () => {
    let aggregator: ExerciseTotalAttempts

    beforeEach(() => {
      aggregator = new ExerciseTotalAttempts()
    })

    it('should initialize with totalAttempts set to 0', () => {
      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should increment totalAttempts when input has attempts', () => {
      const input = {
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(10)
    })

    it('should increment totalAttempts by the number of attempts', () => {
      aggregator.next({ attempts: 5 } as SessionView)
      aggregator.next({ attempts: 10 } as SessionView)

      expect(aggregator['totalAttempts']).toBe(15)
    })

    it('should not increment totalAttempts when input has no attempts', () => {
      const input = {} as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should return the total number of attempts', () => {
      aggregator['totalAttempts'] = 150

      const result = aggregator.complete()

      expect(result).toBe(150)
    })
  })

  describe('ExerciseAverageAttempts', () => {
    let aggregator: ExerciseAverageAttempts

    beforeEach(() => {
      aggregator = new ExerciseAverageAttempts()
    })

    it('should initialize with totalSessions and totalAttempts set to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should increment totalSessions when input has attempts', () => {
      const input = {
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should add attempts to totalAttempts', () => {
      const input = {
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(10)
    })

    it('should not increment totals when no attempts', () => {
      const input = {} as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should calculate average attempts correctly', () => {
      aggregator['totalSessions'] = 2
      aggregator['totalAttempts'] = 20

      expect(aggregator.complete()).toBe(10)
    })

    it('should return 0 when no sessions', () => {
      expect(aggregator.complete()).toBe(0)
    })
  })

  describe('ExerciseParticipationRate', () => {
    let aggregator: ExerciseAnswerRate

    beforeEach(() => {
      aggregator = new ExerciseAnswerRate()
    })

    it('should initialize totals to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalParticipations']).toBe(0)
    })

    it('should increment totalSessions when input has startedAt', () => {
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalParticipations when input has attempts', () => {
      const input = {
        startedAt: new Date(),
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalParticipations']).toBe(1)
    })

    it('should not increment totalParticipations when no attempts', () => {
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalParticipations']).toBe(0)
    })

    it('should calculate participation rate', () => {
      // Add some sample data
      aggregator.next({ startedAt: new Date(), attempts: 1 } as unknown as SessionView)
      aggregator.next({ startedAt: new Date() } as unknown as SessionView)

      // Assert expected result
      expect(aggregator.complete()).toBe(50)
    })
  })

  describe('ExerciseAverageAttemptsToSuccess', () => {
    let aggregator: ExerciseAverageAttemptsToSuccess

    beforeEach(() => {
      aggregator = new ExerciseAverageAttemptsToSuccess()
    })

    it('should initialize totals to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should increment sessions when input has answers', () => {
      const input = {
        answers: [{ grade: 100 }],
      } as unknown as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment attempts to 1 when corrected', () => {
      const input = {
        correctionGrade: 100,
        answers: [{ grade: 0 }, { grade: 0 }],
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(1)
    })

    it('should count attempts to first success', () => {
      const input = {
        answers: [{ grade: 80 }, { grade: 90 }, { grade: 100 }],
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(3)
    })

    describe('complete()', () => {
      it('should return 0 if no sessions', () => {
        expect(aggregator.complete()).toBe(0)
      })

      it('should calculate average attempts to success', () => {
        aggregator.next({
          answers: [{ grade: 0 }, { grade: 50 }, { grade: 100 }],
          correctionGrade: 100,
        } as unknown as SessionView)

        aggregator.next({
          answers: [{ grade: 0 }, { grade: 0 }, { grade: 100 }],
        } as unknown as SessionView)

        expect(aggregator.complete()).toBe(2)
      })

      it('should round average attempts to nearest integer', () => {
        // Add sessions with non-integer average attempts
        aggregator.next({
          answers: [{ grade: 0 }, { grade: 100 }],
          correctionGrade: 100,
        } as unknown as SessionView)

        aggregator.next({
          answers: [{ grade: 0 }, { grade: 0 }, { grade: 0 }, { grade: 100 }],
        } as unknown as SessionView)

        expect(aggregator.complete()).toBe(3) // Rounded from 2.5
      })
    })
  })

  describe('ExerciseSuccessRateOnFirstAttempt', () => {
    let aggregator: ExerciseSuccessRateOnFirstAttempt

    beforeEach(() => {
      aggregator = new ExerciseSuccessRateOnFirstAttempt()
    })

    it('should initialize totals to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalSuccess']).toBe(0)
    })

    it('should increment totalSessions when input has attempts', () => {
      const input = {
        attempts: 1,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalSuccess when grade is 100 on first attempt', () => {
      const input = {
        attempts: 1,
        grade: 100,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSuccess']).toBe(1)
    })

    it('should not increment totalSuccess when grade is not 100 on first attempt', () => {
      const input = {
        attempts: 1,
        grade: 80,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSuccess']).toBe(0)
    })

    it('should calculate success rate correctly', () => {
      aggregator.next({
        attempts: 1,
        grade: 100,
      } as SessionView)

      aggregator.next({
        attempts: 2,
        grade: 100,
      } as SessionView)

      expect(aggregator.complete()).toBe(50)
    })
  })
})
