import {
  AnswerStates,
  SESSION_AVERAGE_DURATION,
  SESSION_AVERAGE_SCORE,
  SESSION_AVERAGE_SCORE_BY_MONTH,
  SESSION_DISTRIBUTION_BY_ANSWER_STATE,
  SESSION_SUCCESS_RATE,
  SESSION_TOTAL_DURATION,
  SESSION_TOTAL_DURATION_BY_MONTH,
} from '@platon/feature/result/common'
import { SessionDataEntity } from '../../sessions/session-data.entity'
import { getYearMonthWeek } from '../dashboard.utils'
import { SessionDataAggregator, answerStateFromSession, sessionDurationInSeconds } from './aggregators'

/**
 * Calculates the success rate of sessions.
 *
 * - The success rate is the percentage of sessions that have been graded with a grade of 100.
 */
export class SessionSuccessRate implements SessionDataAggregator<number> {
  readonly id = SESSION_SUCCESS_RATE

  private totalSessions = 0
  private totalSuccess = 0

  next(input: SessionDataEntity): void {
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
  readonly id = SESSION_AVERAGE_SCORE

  private totalSessions = 0
  private totalScores = 0

  next(input: SessionDataEntity): void {
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
 * Calculates the average score for sessions for each month.
 */
export class SessionAverageScoreByMonth implements SessionDataAggregator<Record<string, number>> {
  readonly id = SESSION_AVERAGE_SCORE_BY_MONTH

  private readonly scores = new Map<string, { total: number; count: number }>()

  next(input: SessionDataEntity): void {
    if (input.lastGradedAt) {
      const { year, month, week } = getYearMonthWeek(input.lastGradedAt)

      const id = `${year}:${month}:${week}`
      if (input.attempts) {
        const score = this.scores.get(id) ?? { total: 0, count: 0 }
        score.total += input.correctionGrade ?? input.grade
        score.count++
        this.scores.set(id, score)
      }
    }
  }

  complete(): Record<string, number> {
    return Array.from(this.scores.entries()).reduce((record, [id, score]) => {
      record[id] = Math.round(score.total / score.count)
      return record
    }, {} as Record<string, number>)
  }
}

/**
 * Calculates the total time spent on sessions in seconds.
 */
export class SessionTotalDuration implements SessionDataAggregator<number> {
  readonly id = SESSION_TOTAL_DURATION

  private totalDurations = 0

  next(input: SessionDataEntity): void {
    this.totalDurations += sessionDurationInSeconds(input)
  }

  complete(): number {
    return this.totalDurations
  }
}

/**
 * Calculates the average time spent on sessions.
 */
export class SessionAverageDuration implements SessionDataAggregator<number> {
  readonly id = SESSION_AVERAGE_DURATION

  private totalSessions = 0
  private totalDurations = 0

  next(input: SessionDataEntity): void {
    if (input.attempts) {
      this.totalSessions += 1
      this.totalDurations += sessionDurationInSeconds(input)
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round(this.totalDurations / this.totalSessions) : 0
  }
}

/**
 * Calculates the total duration for sessions for each month.
 */
export class SessionTotalDurationByMonth implements SessionDataAggregator<Record<string, number>> {
  readonly id = SESSION_TOTAL_DURATION_BY_MONTH

  private readonly durations = new Map<string, number>()

  next(input: SessionDataEntity): void {
    if (input.startedAt && input.lastGradedAt) {
      const { year: gradeYear, month: gradeMonth, week: gradeWeek } = getYearMonthWeek(input.lastGradedAt)
      const { year: startYear, month: startMonth, week: startWeek } = getYearMonthWeek(input.startedAt)

      if (gradeYear !== startYear || gradeMonth !== startMonth || gradeWeek !== startWeek) return

      const id = `${startYear}:${startMonth}:${startWeek}`
      if (input.attempts) {
        const duration = this.durations.get(id) ?? 0
        this.durations.set(id, duration + sessionDurationInSeconds(input))
      }
    }
  }

  complete(): Record<string, number> {
    return Array.from(this.durations.entries()).reduce((record, [id, duration]) => {
      record[id] = duration
      return record
    }, {} as Record<string, number>)
  }
}

/**
 * Calculates the distribution of exercise session count by answer state.
 */
export class SessionDistributionByAnswerState implements SessionDataAggregator<Record<AnswerStates, number>> {
  readonly id = SESSION_DISTRIBUTION_BY_ANSWER_STATE

  private readonly distribution = Object.keys(AnswerStates).reduce(
    (record, state) => ({ ...record, [state]: 0 }),
    {} as Record<AnswerStates, number>
  )

  next(input: SessionDataEntity): void {
    const state = answerStateFromSession(input)
    this.distribution[state]++
  }

  complete(): Record<AnswerStates, number> {
    return this.distribution
  }
}
