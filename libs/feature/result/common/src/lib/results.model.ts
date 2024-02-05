import { AnswerStates } from './answer.model'

/**
 * Type that holds values for calculating averages.
 */
export type ValueAverage = {
  /**
   * The sum of all values.
   */
  sum: number

  /**
   * The average of all values.
   */
  avg: number

  /**
   * The total number of values.
   */
  count: number

  /**
   * If sets to true, the value will be treated as a rate (percentage) and multiplied by 100.
   */
  isRate?: boolean
}

/**
 * Results for a user on a specific exercise.
 */
export interface UserExerciseResults {
  /**
   * The unique identifier for the exercise.
   */
  id: string

  /**
   * The success state of the exercise.
   */
  state: AnswerStates

  /**
   * The title of the exercise.
   */
  title: string
  /**
   * The grade for the exercise.
   */
  grade: number

  /**
   * The number of attempts made by the user for this exercise.
   */
  attempts: number

  /**
   * The total duration of the exercise in seconds.
   */
  duration: number

  /**
   * The id of the {@link SessionEntity} associated with the exercise.
   */
  sessionId?: string
}

/**
 * Results for a user across all exercises in an activity.
 */
export interface UserResults {
  /**
   * The unique identifier of the user.
   */
  id: string

  /**
   * The username of the user.
   */
  username: string
  /**
   * The first name of the user.
   */
  firstName: string

  /**
   * The last name of the user.
   */
  lastName: string

  /**
   * The email of the user.
   */
  email: string

  /**
   * A value indicating whether the user is currenlty waiting for corrections.
   *
   * If set to true, the activity result page should not display results.
   */
  correcting?: boolean

  /**
   * A map of exercise results for the user.
   */
  exercises: Record<string, UserExerciseResults>
}

/**
 * Aggregated results for an exercise across all users.
 */
export interface ExerciseResults {
  /**
   * The unique identifier of the exercise.
   */
  id: string

  /**
   * The title of the exercise inside it's activity navigation.
   */
  title: string

  /**
   * Statistics about the exercise states across all users.
   */
  states: Record<AnswerStates, number>

  /**
   * Statistics about the exercise grading across all users.
   */
  grades: ValueAverage

  /**
   * Statistics about the exercise attempts across all users.
   */
  attempts: ValueAverage

  /**
   * Statistics about the exercise durations across all users.
   */
  durations: ValueAverage

  /**
   * Percentage of sessions that have at least one attempt.
   */
  answerRate: ValueAverage

  /**
   * Percentage of sessions that have been graded with a grade of 100.
   */
  successRate: ValueAverage

  /**
   * Percentage of sessions that have been started but not graded at least once.
   */
  dropoutRate: ValueAverage

  /**
   * Average time it takes to attempt an exercise for the first time in seconds.
   */
  averageTimeToAttempt: ValueAverage

  /**
   * Average number of attempts to success (obtain a grade of 100) for exercises in a session.
   */
  averageAttemptsToSuccess: ValueAverage

  /**
   * Percentage of sessions that have been graded with a grade of 100 on the first attempt.
   */
  successRateOnFirstAttempt: ValueAverage
}

/**
 * Results for all exercises and all users in an activity.
 */
export interface ActivityResults {
  /**
   * Results for all users in the activity.
   */
  users: UserResults[]

  /**
   * Results for all exercises in the activity.
   */
  exercises: ExerciseResults[]
}

/**
 * Returns an empty ValueAverage object.
 * @param isRate - If sets to true, the value will be treated as a rate (percentage) and multiplied by 100.
 * @returns {ValueAverage} The empty ValueAverage object.
 */
export const emptyValueAverage = (isRate?: boolean): ValueAverage => ({
  sum: 0,
  avg: 0,
  count: 0,
  isRate: !!isRate,
})

/**
 * Calculates the average value based on the given value and precision.
 * @remarks
 * - If the count is 0, the average will be 0.
 * - the value parameter will be computed with the average and the avg property will be updated.
 * @param value - The value to calculate the average from.
 * @param precision - The number of decimal places to round the average to (default: 0).
 * @returns The calculated average value.
 */
export const calculateAverage = (value: ValueAverage, precision = 0): number => {
  if (value.count === 0) {
    return 0
  }
  const average = Number(((value.sum / value.count) * (value.isRate ? 100 : 1)).toFixed(precision))
  return (value.avg = average)
}

export const emptyExerciseResults = (defaults?: { id: string; title: string }): ExerciseResults => ({
  id: defaults?.id ?? '',
  title: defaults?.title ?? '',
  grades: emptyValueAverage(),
  attempts: emptyValueAverage(),
  durations: emptyValueAverage(),
  answerRate: emptyValueAverage(true),
  successRate: emptyValueAverage(true),
  dropoutRate: emptyValueAverage(true),
  averageTimeToAttempt: emptyValueAverage(),
  averageAttemptsToSuccess: emptyValueAverage(),
  successRateOnFirstAttempt: emptyValueAverage(true),
  states: {
    ANSWERED: 0,
    SUCCEEDED: 0,
    PART_SUCC: 0,
    FAILED: 0,
    STARTED: 0,
    NOT_STARTED: 0,
    ERROR: 0,
  },
})

export const emptyUserResults = (defaults?: Partial<UserResults>): UserResults => ({
  id: '',
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  correcting: false,
  exercises: {},
  ...defaults,
})
