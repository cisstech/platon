import { SessionView } from '../../sessions/session.view'
import {
  ExerciseAnswerRate,
  ExerciseAverageAttempts,
  ExerciseAverageAttemptsToSuccess,
  ExerciseDropOutRate,
  ExerciseSuccessRateOnFirstAttempt,
  ExerciseTotalAttempts,
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
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalSessions']).toBe(1)
    })

    it('should increment totalAttempts when input has attempts', () => {
      const input = {
        startedAt: new Date(),
        attempts: 10,
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(1)
    })

    it('should not increment totalAttempts when no attempts', () => {
      const input = {
        startedAt: new Date(),
      } as SessionView

      aggregator.next(input)

      expect(aggregator['totalAttempts']).toBe(0)
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
