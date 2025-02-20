import { ExerciseVariables, extractExercisesFromActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity, ActivityMemberView } from '@platon/feature/course/server'
import {
  ACTIVITY_ANSWER_RATE,
  ACTIVITY_DISTRIBUTION,
  ACTIVITY_DROP_OUT_RATE,
  ACTIVITY_EXERCISE_RESULTS,
  ACTIVITY_TOTAL_ATTEMPTS,
  ACTIVITY_TOTAL_COMPLETIONS,
  ACTIVITY_USER_RESULTS,
  AnswerStates,
  ExerciseDetails,
  ExerciseResults,
  UserActivityResultsDistribution,
  UserResults,
  calculateAverage,
  emptyExerciseResults,
  emptyUserResults,
} from '@platon/feature/result/common'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { SessionDataEntity } from '../../sessions/session-data.entity'
import { SessionDataAggregator, answerStateFromSession, sessionDurationInSeconds } from './aggregators'

type ActivityUserResultsResultsArgs = {
  activity?: ActivityEntity | null
  activityMembers?: ActivityMemberView[] | null
  exerciseSessions: SessionDataEntity[]
}

type ActivityExerciseResultsArgs = {
  activity?: ActivityEntity | null
  exerciseSessions: SessionDataEntity[]
}

/**
 * Calculates the results for each user in an activity.
 */
export class ActivityUserResults implements SessionDataAggregator<UserResults[]> {
  readonly id = ACTIVITY_USER_RESULTS
  private readonly anonymous = 'anonymous'
  private readonly userResults = new Map<string, UserResults>()
  private readonly exerciseSessions = new Map<string, SessionDataEntity>()

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
      const activityExercises = extractExercisesFromActivityVariables(activity.source.variables)
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

  next(input: SessionDataEntity): void {
    if (input.parentId) return

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
      userExercise.state = answerStateFromSession(exerciseSession)
      userExercise.duration = sessionDurationInSeconds(exerciseSession)
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

/**
 * Percentage of of sessions with at least one exercise attempted.
 */
export class ActivityAnswerRate implements SessionDataAggregator<number> {
  readonly id = ACTIVITY_ANSWER_RATE

  private totalSessions = 0
  private totalAnswers = 0

  next(input: SessionDataEntity): void {
    if (input.parentId) return

    this.totalSessions++
    if (input.activityNavigation?.exercises?.some((exercise) => exercise.state !== AnswerStates.NOT_STARTED)) {
      this.totalAnswers++
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalAnswers / this.totalSessions) * 100) : 0
  }
}

/**
 * Calculates the results for each exercise in an activity.
 */
export class ActivityExerciseResults implements SessionDataAggregator<ExerciseResults[]> {
  readonly id = ACTIVITY_EXERCISE_RESULTS

  private readonly exerciseResults = new Map<string, ExerciseResults>()
  private readonly exerciseSessions = new Map<string, SessionDataEntity>()

  constructor(args: ActivityExerciseResultsArgs) {
    const { activity, exerciseSessions } = args
    exerciseSessions.forEach((exercise) => {
      this.exerciseSessions.set(exercise.id, exercise)
    })

    if (activity) {
      const activityExercises = extractExercisesFromActivityVariables(activity.source.variables)
      activityExercises.forEach((exercise) => {
        const variables = exercise.source.variables as ExerciseVariables
        this.exerciseResults.set(
          exercise.id,
          emptyExerciseResults({ id: exercise.id, title: exercise.overrides?.title ?? variables.title })
        )
      })
    }
  }

  next(input: SessionDataEntity): void {
    if (input.parentId) return
    input.activityNavigation?.exercises.forEach((exercise) => {
      const session = this.exerciseSessions.get(exercise.sessionId)
      if (!session) return

      const grade = session.correctionGrade ?? session.grade
      const state = answerStateFromSession(session)
      const duration = sessionDurationInSeconds(session)

      const exerciseResults = this.exerciseResults.get(exercise.id) ?? emptyExerciseResults()
      exerciseResults.id = exerciseResults.id || exercise.id
      exerciseResults.title = exerciseResults.title || exercise.title

      exerciseResults.states[state]++

      exerciseResults.grades.sum += grade < 0 ? 0 : grade
      exerciseResults.grades.count += grade < 0 ? 0 : 1

      exerciseResults.attempts.sum += session.attempts
      exerciseResults.attempts.count += session.attempts ? 1 : 0

      exerciseResults.durations.sum += duration
      exerciseResults.durations.count += duration ? 1 : 0

      exerciseResults.answerRate.sum += session.attempts ? 1 : 0
      exerciseResults.answerRate.count += session.startedAt ? 1 : 0

      exerciseResults.successRate.sum += grade === 100 ? 1 : 0
      exerciseResults.successRate.count += session.attempts ? 1 : 0

      exerciseResults.dropoutRate.sum += !session.lastGradedAt ? 1 : 0
      exerciseResults.dropoutRate.count += session.startedAt ? 1 : 0

      exerciseResults.details.push(grade < 0 ? 0 : grade)

      if (session.startedAt && session.attempts && session.answers?.length) {
        exerciseResults.averageTimeToAttempt.count++
        exerciseResults.averageTimeToAttempt.sum += differenceInSeconds(
          new Date(session.answers[0].createdAt),
          session.startedAt!
        )

        const firstGrade = session.correctionGrade ?? session.answers.find((answer) => answer.grade >= 0)?.grade ?? -1

        const attemptsToSuccess =
          session.correctionGrade === 100 ? 1 : session.answers.findIndex((answer) => answer.grade === 100) + 1

        exerciseResults.averageAttemptsToSuccess.sum += attemptsToSuccess
        exerciseResults.averageAttemptsToSuccess.count++

        exerciseResults.successRateOnFirstAttempt.sum += firstGrade === 100 ? 1 : 0
        exerciseResults.successRateOnFirstAttempt.count++
      }

      this.exerciseResults.set(exerciseResults.id, exerciseResults)
    })
  }

  complete(): ExerciseResults[] {
    const results = Array.from(this.exerciseResults.values())
    results.forEach((exerciseResult) => {
      calculateAverage(exerciseResult.grades)
      calculateAverage(exerciseResult.attempts)
      calculateAverage(exerciseResult.durations)
      calculateAverage(exerciseResult.answerRate)
      calculateAverage(exerciseResult.successRate)
      calculateAverage(exerciseResult.dropoutRate)
      calculateAverage(exerciseResult.averageTimeToAttempt)
      calculateAverage(exerciseResult.averageAttemptsToSuccess)
      calculateAverage(exerciseResult.successRateOnFirstAttempt)
    })
    return results
  }
}

/**
 * Percentage of sessions started but not every exercise in the activity has been attempted at least once.
 */
export class ActivityDropoutRate implements SessionDataAggregator<number> {
  readonly id = ACTIVITY_DROP_OUT_RATE

  private totalSessions = 0
  private totalDropOuts = 0

  next(input: SessionDataEntity): void {
    if (input.parentId) return

    this.totalSessions++

    if (
      input.activityNavigation?.exercises?.some((exercise) =>
        [AnswerStates.NOT_STARTED, AnswerStates.STARTED].includes(exercise.state)
      )
    ) {
      this.totalDropOuts++
    }
  }

  complete(): number {
    return this.totalSessions > 0 ? Math.round((this.totalDropOuts / this.totalSessions) * 100) : 0
  }
}

/**
 * Total number of times an activity has been attempted (at least one exercise in the activity has been attempted).
 */
export class ActivityTotalAttempts implements SessionDataAggregator<number> {
  readonly id = ACTIVITY_TOTAL_ATTEMPTS

  private total = 0

  next(input: SessionDataEntity): void {
    if (input.parentId) return
    // if (!input.activityNavigation?.terminated) return

    this.total += input.attempts ? 1 : 0
  }

  complete(): number {
    return this.total
  }
}

/**
 * Total number of completions for an activity (every exercise in the activity has been attempted at least once).
 */
export class ActivityTotalCompletions implements SessionDataAggregator<number> {
  readonly id = ACTIVITY_TOTAL_COMPLETIONS

  private total = 0

  next(input: SessionDataEntity): void {
    if (input.parentId) return

    this.total += input.activityNavigation?.exercises?.every((exercise) => exercise.state !== AnswerStates.NOT_STARTED)
      ? 1
      : 0
  }

  complete(): number {
    return this.total
  }
}

export class ActivityDistribution implements SessionDataAggregator<UserActivityResultsDistribution[]> {
  readonly id = ACTIVITY_DISTRIBUTION

  private map = new Map<string, { user: UserActivityResultsDistribution; data: Map<string, ExerciseDetails[]> }>()
  private readonly anonymous = 'anonymous'

  constructor(args: ActivityUserResultsResultsArgs) {
    const { activityMembers } = args

    activityMembers
      ?.sort((a, b) => a.username.localeCompare(b.username))
      ?.forEach((member) => {
        this.map.set(member.id, {
          user: {
            id: member.id,
            username: member.username,
            firstName: member.firstName,
            lastName: member.lastName,
            nbSuccess: {},
          },
          data: new Map<string, ExerciseDetails[]>(),
        })
      })
  }

  next(input: SessionDataEntity): void {
    const userMap = this.map.get(input.user?.id ?? this.anonymous)
    const answers = input.answers
    const firstSuccess = answers?.find((answer) => answer.grade === 100) ?? answers?.find((answer) => answer.grade >= 0) // first success or first attempt
    const date = new Date(firstSuccess?.createdAt ?? 0).setUTCHours(0, 0, 0, 0)
    const formattedDate = new Date(date).toISOString().split('T')[0]
    if (!userMap) return
    let forDate = userMap.data.get(formattedDate)
    if (!forDate) {
      forDate = []
      userMap.data.set(formattedDate, forDate)
    }
    forDate.push({ id: input.resourceId, title: input.resourceName, grade: input.grade })
  }

  complete(): UserActivityResultsDistribution[] {
    return Array.from(this.map.values()).map((entry) => {
      return {
        ...entry.user,
        nbSuccess: Array.from(entry.data.entries()).reduce((acc, [date, exercises]) => {
          acc[date] = exercises.filter((exercise) => exercise.grade === 100).length ?? 0
          return acc
        }, {} as Record<string, number>),
      }
    })
  }
}
