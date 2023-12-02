import {
  AnswerStates,
  EXERCISE_AVERAGE_ATTEMPTS,
  EXERCISE_AVERAGE_ATTEMPTS_TO_SUCCESS,
  EXERCISE_AVERAGE_SCORE,
  EXERCISE_AVERAGE_TIME,
  EXERCISE_DISTRIBUTION_BY_ANSWER_STATE,
  EXERCISE_DROP_OUT_RATE,
  EXERCISE_PARTICIPATION_RATE,
  EXERCISE_SUCCESS_RATE,
  EXERCISE_SUCCESS_RATE_ON_FIRST_ATTEMPT,
  EXERCISE_TOTAL_ATTEMPTS,
  answerStateFromGrade,
} from '@platon/feature/result/common'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { SessionView } from '../../sessions/session.view'
import { SessionDataAggregator } from './aggregators'

//region COMMON

/**
 * Calculates the success rate of sessions.
 *
 * - The success rate is the percentage of sessions that have been graded with a grade of 100.
 */
export class SessionSuccessRate implements SessionDataAggregator<number> {
  readonly id = EXERCISE_SUCCESS_RATE

  private totalSessions = 0
  private totalSuccess = 0

  next(input: SessionView): void {
    const grade = input.correctionGrade ?? input.grade
    if (input.attempts) {
      this.totalSessions++
      this.totalSuccess += grade === 100 ? 1 : 0
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalSuccess / this.totalSessions) * 100) : 0
  }
}

/**
 * Calculates the average score for sessions.
 */
export class SessionAverageScore implements SessionDataAggregator<number> {
  readonly id = EXERCISE_AVERAGE_SCORE

  private totalSessions = 0
  private totalScores = 0

  next(input: SessionView): void {
    const grade = input.correctionGrade ?? input.grade
    if (input.attempts) {
      this.totalSessions++
      this.totalScores += grade < 0 ? 0 : grade
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round(this.totalScores / this.totalSessions) : 0
  }
}

/**
 * Calculates the average time spent on sessions.
 */
export class SessionAverageDuration implements SessionDataAggregator<number> {
  readonly id = EXERCISE_AVERAGE_TIME

  private totalSessions = 0
  private totalDurations = 0

  next(input: SessionView): void {
    this.totalSessions += input.startedAt ? 1 : 0
    this.totalDurations +=
      input.lastGradedAt && input.startedAt ? differenceInSeconds(input.lastGradedAt, input.startedAt) : 0
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round(this.totalDurations / this.totalSessions) : 0
  }
}

/**
 * Calculates the distribution of exercise session count by answer state.
 */
export class SessionDistributionByAnswerState implements SessionDataAggregator<Record<AnswerStates, number>> {
  readonly id = EXERCISE_DISTRIBUTION_BY_ANSWER_STATE

  private readonly distribution = Object.keys(AnswerStates).reduce(
    (record, state) => ({ ...record, [state]: 0 }),
    {} as Record<AnswerStates, number>
  )

  next(input: SessionView): void {
    const state = answerStateFromGrade(input.correctionGrade ?? input.grade)
    this.distribution[state]++
  }

  complete(): Record<AnswerStates, number> {
    return this.distribution
  }
}

//#endregion

//#region EXERCISE

/**
 * Calculates the exercise answer rate based on session data.
 *
 * - The answer rate is the percentage of sessions that have at least one attempt.
 */
export class ExerciseAnswerRate implements SessionDataAggregator<number> {
  readonly id = EXERCISE_PARTICIPATION_RATE

  private totalSessions = 0
  private totalParticipations = 0

  next(input: SessionView): void {
    if (input.startedAt) {
      this.totalSessions++
      if (input.attempts) {
        this.totalParticipations++
      }
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalParticipations / this.totalSessions) * 100) : 0
  }
}

/**
 * Represents an aggregator for calculating the exercise drop-out rate.
 *
 * - The drop-out rate is the percentage of sessions that have been started but not graded at least once.
 */
export class ExerciseDropOutRate implements SessionDataAggregator<number> {
  readonly id = EXERCISE_DROP_OUT_RATE

  private totalSessions = 0
  private totalDropOuts = 0

  next(input: SessionView): void {
    if (input.startedAt) {
      this.totalSessions++
      if (!input.lastGradedAt) {
        this.totalDropOuts++
      }
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalDropOuts / this.totalSessions) * 100) : 0
  }
}

/**
 * Calculates the total number of attempts for an exercise.
 */
export class ExerciseTotalAttempts implements SessionDataAggregator<number> {
  readonly id = EXERCISE_TOTAL_ATTEMPTS

  private totalAttempts = 0

  next(input: SessionView): void {
    this.totalAttempts += input.attempts
  }

  complete(): number {
    return this.totalAttempts
  }
}

/**
 * Calculates the average number of attempts per exercise session.
 */
export class ExerciseAverageAttempts implements SessionDataAggregator<number> {
  readonly id = EXERCISE_AVERAGE_ATTEMPTS

  private totalSessions = 0
  private totalAttempts = 0

  next(input: SessionView): void {
    if (input.attempts) {
      this.totalSessions++
      this.totalAttempts += input.attempts
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round(this.totalAttempts / this.totalSessions) : 0
  }
}

/**
 * Calculates the average number of attempts to success for exercises in a session.
 *
 * - The average number of attempts to success is the average number of attempts before the first success.
 * - If the session is corrected, the number of attempts to success is always 1.
 */
export class ExerciseAverageAttemptsToSuccess implements SessionDataAggregator<number> {
  readonly id = EXERCISE_AVERAGE_ATTEMPTS_TO_SUCCESS

  private totalSessions = 0
  private totalAttempts = 0

  next(input: SessionView): void {
    if (input.answers?.length) {
      this.totalSessions++
      if (input.correctionGrade === 100) {
        this.totalAttempts++
      } else {
        const index = input.answers.findIndex((answer) => answer.grade === 100)
        this.totalAttempts += index >= 0 ? index + 1 : 0
      }
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round(this.totalAttempts / this.totalSessions) : 0
  }
}

/**
 * Calculates the success rate of exercise sessions on the first attempt.
 *
 * - The success rate on the first attempt is the percentage of sessions that have been graded with a grade of 100 on the first attempt.
 */
export class ExerciseSuccessRateOnFirstAttempt implements SessionDataAggregator<number> {
  readonly id = EXERCISE_SUCCESS_RATE_ON_FIRST_ATTEMPT

  private totalSessions = 0
  private totalSuccess = 0

  next(input: SessionView): void {
    const grade = input.correctionGrade ?? input.grade
    if (input.attempts) {
      this.totalSessions++
      this.totalSuccess += grade === 100 && input.attempts === 1 ? 1 : 0
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalSuccess / this.totalSessions) * 100) : 0
  }
}

//#endregion

export const exerciseSessionAggregators = (): SessionDataAggregator[] => [
  new SessionSuccessRate(),
  new SessionAverageScore(),
  new SessionAverageDuration(),
  new SessionDistributionByAnswerState(),

  new ExerciseAnswerRate(),
  new ExerciseDropOutRate(),
  new ExerciseTotalAttempts(),
  new ExerciseAverageAttempts(),
  new ExerciseSuccessRateOnFirstAttempt(),
  new ExerciseAverageAttemptsToSuccess(),
]

export const activitySessionAggregators = (): SessionDataAggregator[] => [
  new SessionSuccessRate(),
  new SessionAverageScore(),
  new SessionAverageDuration(),
  new SessionDistributionByAnswerState(),
]
