import { SessionDataEntity } from '../../sessions/session-data.entity'
import {
  ExerciseAnswerRate,
  ExerciseAverageAttempts,
  ExerciseAverageAttemptsToSuccess,
  ExerciseDropOutRate,
  ExerciseSuccessRateOnFirstAttempt,
  ExerciseTotalAttempts,
  ExerciseUniqueAttempts,
} from './exercise.aggregator'

describe('ExerciseAggregators', () => {
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
        parentId: '1',
        startedAt: new Date(),
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalDropOuts when no lastGradedAt', () => {
      const input = { parentId: '1', startedAt: new Date() } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalDropOuts']).toBe(1)
    })

    it('should not increment totalDropOuts when lastGradedAt exists', () => {
      const input = { parentId: '1', startedAt: new Date(), lastGradedAt: new Date() } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalDropOuts']).toBe(0)
    })

    describe('complete()', () => {
      it('should return 0 if no sessions', () => {
        expect(aggregator.complete()).toBe(0)
      })

      it('should calculate correct drop-out rate', () => {
        aggregator.next({ parentId: '1', startedAt: new Date() } as unknown as SessionDataEntity) // started
        aggregator.next({
          parentId: '1',
          startedAt: new Date(),
          lastGradedAt: new Date(),
        } as unknown as SessionDataEntity) // completed
        aggregator.next({ parentId: '1', startedAt: new Date() } as unknown as SessionDataEntity) // started but not completed

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
      const input = { parentId: '1', attempts: 10 } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(10)
    })

    it('should increment totalAttempts by the number of attempts', () => {
      aggregator.next({ parentId: '1', attempts: 5 } as SessionDataEntity)
      aggregator.next({ parentId: '1', attempts: 10 } as SessionDataEntity)

      expect(aggregator['totalAttempts']).toBe(15)
    })

    it('should not increment totalAttempts when input has no attempts', () => {
      const input = {} as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should return the total number of attempts', () => {
      aggregator['totalAttempts'] = 150

      const result = aggregator.complete()

      expect(result).toBe(150)
    })
  })

  describe('ExerciceUniqueAttempts', () => {
    let aggregator: ExerciseUniqueAttempts

    beforeEach(() => {
      aggregator = new ExerciseUniqueAttempts()
    })

    it('should initialize with totalUniqueAttempts set to 0', () => {
      expect(aggregator['totalUniqueAttempts']).toBe(0)
    })

    it('should increment totalUniqueAttempts when input has attempts', () => {
      const input = { parentId: '1', attempts: 10 } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalUniqueAttempts']).toBe(1)
    })

    it('should increment totalUniqueAttempts by the number of unique attempts', () => {
      aggregator.next({ parentId: '1', attempts: 5 } as SessionDataEntity)
      aggregator.next({ parentId: '1', attempts: 10 } as SessionDataEntity)

      expect(aggregator['totalUniqueAttempts']).toBe(2)
    })

    it('should not increment totalUniqueAttempts when input has no attempts', () => {
      const input = {} as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalUniqueAttempts']).toBe(0)
    })

    it('should return the total number of attempts', () => {
      aggregator['totalUniqueAttempts'] = 150

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
      const input = { parentId: '1', attempts: 10 } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should add attempts to totalAttempts', () => {
      const input = { parentId: '1', attempts: 10 } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(10)
    })

    it('should not increment totals when no attempts', () => {
      const input = { parentId: '1' } as SessionDataEntity

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

  describe('ExerciseAnswerRate', () => {
    let aggregator: ExerciseAnswerRate

    beforeEach(() => {
      aggregator = new ExerciseAnswerRate()
    })

    it('should initialize totals to 0', () => {
      expect(aggregator['totalSessions']).toBe(0)
      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should increment totalSessions when input has startedAt', () => {
      const input = { parentId: '1', startedAt: new Date() } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalAttempts when input has attempts', () => {
      const input = { parentId: '1', startedAt: new Date(), attempts: 10 } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(1)
    })

    it('should not increment totalAttempts when no attempts', () => {
      const input = { parentId: '1', startedAt: new Date() } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(0)
    })

    it('should calculate participation rate', () => {
      // Add some sample data
      aggregator.next({ parentId: '1', startedAt: new Date(), attempts: 1 } as unknown as SessionDataEntity)
      aggregator.next({ parentId: '1', startedAt: new Date() } as unknown as SessionDataEntity)

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
      expect(aggregator['totalAttemptsToSuccess']).toBe(0)
    })

    it('should increment sessions when input has answers', () => {
      const input = {
        parentId: '1',
        attempts: 1,
        answers: [{ grade: 100 }],
      } as unknown as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment attempts to 1 when corrected', () => {
      const input = {
        parentId: '1',
        correctionGrade: 100,
        attempts: 2,
        answers: [{ grade: 0 }, { grade: 0 }],
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttemptsToSuccess']).toBe(1)
    })

    it('should count attempts to first success', () => {
      const input = {
        parentId: '1',
        attempts: 3,
        answers: [{ grade: 80 }, { grade: 90 }, { grade: 100 }],
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalAttemptsToSuccess']).toBe(3)
    })

    describe('complete()', () => {
      it('should return 0 if no sessions', () => {
        expect(aggregator.complete()).toBe(0)
      })

      it('should calculate average attempts to success', () => {
        aggregator.next({
          parentId: '1',
          attempts: 3,
          answers: [{ grade: 0 }, { grade: 50 }, { grade: 100 }],
          correctionGrade: 100,
        } as unknown as SessionDataEntity)

        aggregator.next({
          parentId: '1',
          attempts: 3,
          answers: [{ grade: 0 }, { grade: 0 }, { grade: 100 }],
        } as unknown as SessionDataEntity)

        expect(aggregator.complete()).toBe(2)
      })

      it('should round average attempts to nearest integer', () => {
        // Add sessions with non-integer average attempts
        aggregator.next({
          parentId: '1',
          attempts: 2,
          answers: [{ grade: 0 }, { grade: 100 }],
          correctionGrade: 100,
        } as unknown as SessionDataEntity)

        aggregator.next({
          parentId: '1',
          attempts: 3,
          answers: [{ grade: 0 }, { grade: 0 }, { grade: 0 }, { grade: 100 }],
        } as unknown as SessionDataEntity)

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
      expect(aggregator['totalSuccessOnFirstAttempt']).toBe(0)
    })

    it('should increment totalSessions when input has attempts', () => {
      const input = {
        parentId: '1',
        attempts: 1,
        answers: [{ grade: 100 }],
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalSuccessOnFirstAttempt when grade is 100 on first attempt', () => {
      const input = {
        parentId: '1',
        attempts: 1,
        grade: 100,
        answers: [{ grade: 100 }],
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSuccessOnFirstAttempt']).toBe(1)
    })

    it('should not increment totalSuccessOnFirstAttempt when grade is not 100 on first attempt', () => {
      const input = {
        parentId: '1',
        attempts: 1,
        grade: 80,
        answers: [{ grade: 80 }],
      } as SessionDataEntity

      aggregator.next(input)

      expect(aggregator['totalSuccessOnFirstAttempt']).toBe(0)
    })

    it('should calculate success rate correctly', () => {
      aggregator.next({
        parentId: '1',
        attempts: 1,
        grade: 100,
        answers: [{ grade: 100 }],
      } as SessionDataEntity)

      aggregator.next({
        parentId: '1',
        attempts: 2,
        grade: 100,
        answers: [{ grade: 0 }, { grade: 100 }],
      } as SessionDataEntity)

      expect(aggregator.complete()).toBe(50)
    })
  })
})
