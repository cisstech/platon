/**
 * Percentage of sessions that have been graded with a grade of 100.
 */
export const SESSION_SUCCESS_RATE = 'session.success-rate'

/**
 * Average score for sessions.
 */
export const SESSION_AVERAGE_SCORE = 'session.average-score'

/**
 * Total time spent on sessions in seconds.
 */
export const SESSION_TOTAL_DURATION = 'session.total-duration'

/**
 * Average time spent on sessions.
 */
export const SESSION_AVERAGE_DURATION = 'session.average-duration'

/**
 * Average score for sessions for each month.
 */
export const SESSION_AVERAGE_SCORE_BY_MONTH = 'session.average-score-by-month'

/**
 * Total time spent on sessions for each month in seconds.
 */
export const SESSION_TOTAL_DURATION_BY_MONTH = 'session.total-duration-by-month'

/**
 * Distribution of exercise session count by answer state.
 */
export const SESSION_DISTRIBUTION_BY_ANSWER_STATE = 'session.distribution-by-answer-state'

/**
 * Percentage of sessions that have at least one attempt.
 */
export const EXERCISE_ANSWER_RATE = 'exercise.answer-rate'

/**
 * Percentage of sessions that have been started but not graded at least once.
 */
export const EXERCISE_DROP_OUT_RATE = 'exercise.drop-out-rate'

/**
 * Total number of attempts for an exercise.
 */
export const EXERCISE_TOTAL_ATTEMPTS = 'exercise.total-attempts'

/**
 * Total number of unique attempts for an exercise.
 */
export const EXERCISE_UNIQUE_ATTEMPTS = 'exercise.unique-attempts'

/**
 * Average number of attempts per exercise session.
 */
export const EXERCISE_AVERAGE_ATTEMPTS = 'exercise.average-attempts'

/**
 * Average time it takes to attempt an exercise for the first time in seconds.
 */
export const EXERCISE_AVERAGTE_TIME_TO_ATTEMPT = 'exercise.average-time-to-attempt'

/**
 * Average number of attempts to success for exercises in a session.
 */
export const EXERCISE_AVERAGE_ATTEMPTS_TO_SUCCESS = 'exercise.average-attempts-to-success'

/**
 * Percentage of sessions that have been graded with a grade of 100 on the first attempt.
 */
export const EXERCISE_SUCCESS_RATE_ON_FIRST_ATTEMPT = 'exercise.success-rate-on-first-attempt'

/**
 * Results for each user in an activity.
 */
export const ACTIVITY_USER_RESULTS = 'activity.user-results'

/**
 * Percentage of of sessions with at least one exercise attempted.
 */
export const ACTIVITY_ANSWER_RATE = 'activity.answer-rate'

/**
 * Percentage of sessions started but not every exercise in the activity has been attempted at least once.
 */
export const ACTIVITY_DROP_OUT_RATE = 'activity.drop-out-rate'

/**
 * Total number of times an activity has been attempted (at least one exercise in the activity has been attempted).
 */
export const ACTIVITY_TOTAL_ATTEMPTS = 'activity.total-attempts'

/**
 * Total number of completions for an activity (every exercise in the activity has been attempted at least once).
 */
export const ACTIVITY_TOTAL_COMPLETIONS = 'activity.total-completions'

/**
 * Results for each exercise in an activity.
 */
export const ACTIVITY_EXERCISE_RESULTS = 'activity.exercise-results'

/**
 * List of courses in which an activity is used.
 */
export const ACTIVITY_COURSE_USED_IN_LIST = 'activity.course-used-in-list'

/**
 * Number of courses in which an activity is used.
 */
export const ACTIVITY_COURSE_USED_IN_COUNT = 'activity.course-used-in-count'

/**
 * Total number of exercises for a user.
 */
export const USER_COURSE_COUNT = 'user.course-count'

/**
 * Total number of activities for a user.
 */
export const USER_ACTIVITY_COUNT = 'user.activity-count'

/**
 * Total number of exercises attempted by a user.
 */
export const USER_EXERCISE_COUNT = 'user.exercise-count'

export type DashboardOutput = Record<string, unknown>
