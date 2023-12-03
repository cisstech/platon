import { ActivityVariables, ExerciseVariables, extractExercisesFromActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity, ActivityMemberView } from '@platon/feature/course/server'
import {
  ACTIVITY_EXERCISE_RESULTS,
  ACTIVITY_USER_RESULTS,
  AnswerStates,
  EXERCISE_ANSWER_RATE,
  EXERCISE_AVERAGE_ATTEMPTS,
  EXERCISE_AVERAGE_ATTEMPTS_TO_SUCCESS,
  EXERCISE_DROP_OUT_RATE,
  EXERCISE_SUCCESS_RATE_ON_FIRST_ATTEMPT,
  EXERCISE_TOTAL_ATTEMPTS,
  ExerciseResults,
  SESSION_AVERAGE_DURATION,
  SESSION_AVERAGE_SCORE,
  SESSION_DISTRIBUTION_BY_ANSWER_STATE,
  SESSION_SUCCESS_RATE,
  UserResults,
  answerStateFromGrade,
  emptyExerciseResults,
  emptyUserResults,
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
  readonly id = SESSION_SUCCESS_RATE

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
  readonly id = SESSION_AVERAGE_SCORE

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
  readonly id = SESSION_AVERAGE_DURATION

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
  readonly id = SESSION_DISTRIBUTION_BY_ANSWER_STATE

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
  readonly id = EXERCISE_ANSWER_RATE

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

//#region Activity

type ActivityUserResultsResultsArgs = {
  activity?: ActivityEntity | null
  activityMembers?: ActivityMemberView[] | null
  exerciseSessions: SessionView[]
}

/**
 * Calculates the results for each user in an activity.
 */
export class ActivityUserResults implements SessionDataAggregator<UserResults[]> {
  readonly id = ACTIVITY_USER_RESULTS
  private readonly anonymous = 'anonymous'
  private readonly userResults = new Map<string, UserResults>()
  private readonly exerciseSessions = new Map<string, SessionView>()

  constructor(args: ActivityUserResultsResultsArgs) {
    const { activity, activityMembers, exerciseSessions } = args

    activityMembers
      ?.sort((a, b) => a.username.localeCompare(b.username))
      ?.forEach((member) => {
        this.userResults.set(
          member.id,
          emptyUserResults({
            id: member.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            username: member.username,
          })
        )
      })

    exerciseSessions.forEach((exerciseSession) => {
      this.exerciseSessions.set(exerciseSession.id, exerciseSession)
      this.userResults.set(
        exerciseSession.user?.id ?? this.anonymous,
        emptyUserResults({
          id: exerciseSession.user?.id ?? this.anonymous,
          email: exerciseSession.user?.email ?? this.anonymous,
          firstName: exerciseSession.user?.firstName ?? this.anonymous,
          lastName: exerciseSession.user?.lastName ?? this.anonymous,
          username: exerciseSession.user?.username ?? this.anonymous,
        })
      )
    })

    if (activity) {
      const activityExercises = extractExercisesFromActivityVariables(activity.source.variables as ActivityVariables)
      activityExercises.forEach((exercise) => {
        const variables = exercise.source.variables as ExerciseVariables
        Array.from(this.userResults.values()).forEach((userResult) => {
          userResult.exercises[exercise.id] = {
            id: exercise.id,
            title: exercise.overrides?.title ?? variables.title,
            grade: -1,
            attempts: 0,
            duration: 0,
            state: AnswerStates.NOT_STARTED,
          }
        })
      })
    }
  }

  next(input: SessionView): void {
    input.activityNavigation?.exercises.forEach((exercise) => {
      const exerciseSession = this.exerciseSessions.get(exercise.sessionId)
      if (!exerciseSession) return

      const userId = exerciseSession.userId ?? this.anonymous
      const userResult =
        this.userResults.get(userId) ??
        emptyUserResults({
          id: input.userId ?? this.anonymous,
          email: input.user?.email ?? this.anonymous,
          firstName: input.user?.firstName ?? this.anonymous,
          lastName: input.user?.lastName ?? this.anonymous,
          username: input.user?.username ?? this.anonymous,
        })

      if (!userResult) return

      const userExercise = userResult.exercises[exercise.id] ?? {
        id: exercise.id,
        title: exercise.title,
        sessionId: exercise.sessionId,
      }

      userExercise.grade = exerciseSession.correctionGrade ?? exerciseSession.grade
      userExercise.state = answerStateFromGrade(exerciseSession.correctionGrade ?? exerciseSession.grade)
      userExercise.duration =
        exerciseSession.lastGradedAt && exerciseSession.startedAt
          ? differenceInSeconds(exerciseSession.lastGradedAt, exerciseSession.startedAt)
          : 0
      userExercise.attempts = exerciseSession.attempts

      userResult.correcting =
        userResult.correcting || (exerciseSession.correctionEnabled && !exerciseSession.correctionId)

      userExercise.sessionId = exerciseSession.id
      userResult.exercises[exercise.id] = userExercise
      this.userResults.set(userId, userResult)
    })
  }

  complete(): UserResults[] {
    const results = Array.from(this.userResults.values())
    results.forEach((userResult) => {
      if (userResult.correcting) {
        Object.keys(userResult.exercises).forEach((exerciseId) => {
          const exercice = userResult.exercises[exerciseId]
          exercice.grade = -1
          exercice.state = AnswerStates.ANSWERED
        })
      }
    })
    return results
  }
}

type ActivityExerciseResultsArgs = {
  activity?: ActivityEntity | null
  exerciseSessions: SessionView[]
}

/**
 * Calculates the results for each exercise in an activity.
 */
export class ActivityExerciseResults implements SessionDataAggregator<ExerciseResults[]> {
  readonly id = ACTIVITY_EXERCISE_RESULTS

  private readonly exerciseResults = new Map<string, ExerciseResults>()
  private readonly exerciseSessions = new Map<string, SessionView>()

  constructor(args: ActivityExerciseResultsArgs) {
    const { activity, exerciseSessions } = args
    exerciseSessions.forEach((exercise) => {
      this.exerciseSessions.set(exercise.id, exercise)
    })

    if (activity) {
      const activityExercises = extractExercisesFromActivityVariables(activity.source.variables as ActivityVariables)
      activityExercises.forEach((exercise) => {
        const variables = exercise.source.variables as ExerciseVariables
        this.exerciseResults.set(
          exercise.id,
          emptyExerciseResults({ id: exercise.id, title: exercise.overrides?.title ?? variables.title })
        )
      })
    }
  }

  next(input: SessionView): void {
    input.activityNavigation?.exercises.forEach((exercise) => {
      const session = this.exerciseSessions.get(exercise.sessionId)
      if (!session) return

      const grade = session.correctionGrade ?? session.grade
      const state = answerStateFromGrade(grade)
      const duration =
        session.lastGradedAt && session.startedAt ? differenceInSeconds(session.lastGradedAt, session.startedAt) : 0

      const exerciseResults = this.exerciseResults.get(exercise.id) ?? emptyExerciseResults()
      exerciseResults.id = exerciseResults.id || exercise.id
      exerciseResults.title = exerciseResults.title || exercise.title

      exerciseResults.states[state]++

      exerciseResults.grades.sum += grade < 0 ? 0 : grade
      exerciseResults.grades.count += grade < 0 ? 0 : 1

      exerciseResults.attempts.sum += session.attempts
      exerciseResults.attempts.count += session.attempts ? 1 : 0

      exerciseResults.durations.sum += duration
      exerciseResults.durations.count++

      this.exerciseResults.set(exerciseResults.id, exerciseResults)
    })
  }

  complete(): ExerciseResults[] {
    const results = Array.from(this.exerciseResults.values())

    results.forEach((exerciseResult) => {
      exerciseResult.grades.avg = exerciseResult.grades.count
        ? exerciseResult.grades.sum / exerciseResult.grades.count
        : exerciseResult.grades.sum

      exerciseResult.attempts.avg = exerciseResult.attempts.count
        ? exerciseResult.attempts.sum / exerciseResult.attempts.count
        : exerciseResult.attempts.sum

      exerciseResult.durations.avg = exerciseResult.durations.count
        ? exerciseResult.durations.sum / exerciseResult.durations.count
        : exerciseResult.durations.sum
    })

    return results
  }
}

//#endregion
