import { AnswerStates } from '@platon/feature/result/common'
import { SessionDataEntity } from '../../sessions/session-data.entity'
import {
  SessionAverageDuration,
  SessionAverageScore,
  SessionDistributionByAnswerState,
  SessionSuccessRate,
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
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalSuccess when grade is 100', () => {
      const input = {
        attempts: 10,
        grade: 100,
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSuccess']).toBe(1)
    })

    it('should not increment totalSuccess when grade is not 100', () => {
      const input = {
        attempts: 10,
        grade: 80,
      } as SessionDataEntity

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
        } as SessionDataEntity

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(1)
      })

      it('should not increment totalSessions when input.attempts is undefined', () => {
        const input = {
          startedAt: undefined,
          lastGradedAt: new Date(),
        } as SessionDataEntity

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(0)
      })

      it('should not increment totalSessions when input.attempts is 0', () => {
        const input = {
          startedAt: undefined,
          lastGradedAt: new Date(),
          attempts: 0,
        } as SessionDataEntity

        aggregator.next(input)

        expect(aggregator['totalSessions']).toBe(0)
      })

      it('should add the difference in seconds between input.lastGradedAt and input.startedAt to totalDurations when both are defined', () => {
        const input = {
          startedAt: new Date(2023, 0, 1, 10, 0, 0),
          lastGradedAt: new Date(2023, 0, 1, 10, 0, 10),
          attempts: 1,
        } as SessionDataEntity

        aggregator.next(input)

        expect(aggregator['totalDurations']).toBe(10)
      })

      it('should not add anything to totalDurations when input.lastGradedAt or input.startedAt is undefined', () => {
        const input = {
          startedAt: new Date(),
          lastGradedAt: undefined,
        } as SessionDataEntity

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
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should add the score to totalScores when grade is positive', () => {
      const input = {
        attempts: 10,
        grade: 80,
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalScores']).toBe(80)
    })

    it('should not add to totalScores when grade is negative', () => {
      const input = {
        attempts: 10,
        grade: -1,
      } as SessionDataEntity

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
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['distribution'].NOT_STARTED).toBe(1)
    })

    it('should be started if startedAt and attempts is 0', () => {
      const input = {
        attempts: 0,
        startedAt: new Date(),
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['distribution'].STARTED).toBe(1)
    })

    it('should increment count for state based on grade', () => {
      aggregator.next({ grade: 100, attempts: 1, startedAt: new Date() } as SessionDataEntity)
      expect(aggregator['distribution'].SUCCEEDED).toBe(1)
    })

    it('should handle multiple sessions', () => {
      aggregator.next({ grade: 100, attempts: 1, startedAt: new Date() } as SessionDataEntity)
      aggregator.next({ grade: 0, attempts: 1, startedAt: new Date() } as SessionDataEntity)

      expect(aggregator['distribution'].SUCCEEDED).toBe(1)
      expect(aggregator['distribution'].FAILED).toBe(1)
    })

    it('should return distribution on complete()', () => {
      aggregator.next({ grade: 100 } as SessionDataEntity)
      aggregator.next({ grade: 100 } as SessionDataEntity)
      aggregator.next({ grade: 0 } as SessionDataEntity)

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
})
