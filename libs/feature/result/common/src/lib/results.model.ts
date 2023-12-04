import { AnswerStates } from './answer.model'

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
   * Statistics about the exercise grading across all users.
   */
  grades: {
    sum: number
    avg: number
    count: number
  }

  /**
   * Statistics about the exercise attempts across all users.
   */
  attempts: {
    sum: number
    avg: number
    count: number
  }

  /**
   * Statistics about the exercise durations across all users.
   */
  durations: {
    sum: number
    avg: number
    count: number
  }

  /**
   * Statistics about the exercise states across all users.
   */
  states: Record<AnswerStates, number>
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

export const emptyExerciseResults = (defaults?: { id: string; title: string }): ExerciseResults => ({
  id: defaults?.id ?? '',
  title: defaults?.title ?? '',
  grades: {
    sum: 0,
    avg: 0,
    count: 0,
  },
  attempts: {
    sum: 0,
    avg: 0,
    count: 0,
  },
  durations: {
    sum: 0,
    avg: 0,
    count: 0,
  },
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
