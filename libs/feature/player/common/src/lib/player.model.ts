/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivitySettings, ActivityVariables, ExerciseFeedback, Variables } from '@platon/feature/compiler'
import { ActivityOpenStates } from '@platon/feature/course/common'
import { AnswerStates } from '@platon/feature/result/common'

export enum PlayerActions {
  NEXT_HINT = 'NEXT_HINT',
  CHECK_ANSWER = 'CHECK_ANSWER',
  SHOW_SOLUTION = 'SHOW_SOLUTION',
  REROLL_EXERCISE = 'REROLL_EXERCISE',
}

export interface PlayerExercise {
  id: string
  sessionId: string
  state: AnswerStates
  title: string
  peerComparison?: boolean
  grade?: number
}

export interface PlayerNavigation {
  started: boolean
  terminated: boolean
  current?: PlayerExercise
  exercises: PlayerExercise[]
}

/**
 * Representation of the `/player/preview` endpoint body.
 */
export interface PreviewInput {
  /** Version of the resource to preview (default: latest) */
  version?: string
  /** Id of the resource to preview. */
  resource: string
  /** Optional variable overrides */
  overrides?: Variables
}

/**
 * Representation of the `/player/play/answers` endpoint body.
 */
export interface PlayAnswersInput {
  /** Session id of the exercise.  */
  sessionId: string
}

/**
 * Representation of the `/player/play/exercises` endpoint body.
 */
export interface PlayExerciseInput {
  /** Session id of the activity containing the exercises to be played.  */
  activitySessionId: string
  /** A list of exercise sessions to start/resume. */
  exerciseSessionIds: string[]
}

/**
 * Representation of the `/player/play/activity` endpoint body.
 */
export interface PlayActivityInput {
  /** Identifier of the course activity to start/resume. */
  activityId: string
}

/**
 * Representation of the `/player/evaluate` endpoint body.
 */
export interface EvalExerciseInput {
  /** Action to do. */
  action: PlayerActions
  /** An exercise session. */
  sessionId: string
  /** Current answers of the user inside of the exercise. */
  answers?: Record<string, any>
}

export interface PreviewOuput {
  exercise?: ExercisePlayer
  activity?: ActivityPlayer
}

export interface PlayAnswersOutput {
  exercises: ExercisePlayer[]
}

export interface PlayExerciseOuput {
  exercises: ExercisePlayer[]
  navigation?: PlayerNavigation
}

export interface PlayActivityOuput {
  activity: ActivityPlayer
}

export interface NextOutput {
  nextExerciseId: string
  terminated: boolean
}

export interface EvalExerciseOutput {
  exercise: ExercisePlayer
  navigation?: PlayerNavigation
}

export interface ExercisePlayer {
  type: 'exercise'
  answerId?: string | null
  sessionId: string
  startedAt?: Date | null
  lastGradedAt?: Date | null
  form: string
  title: string
  statement: string
  hints?: string[] | null
  author?: string | null
  correction?: {
    grade: number
    authorId?: string
    createdAt: Date
    updatedAt: Date
  } | null
  remainingAttempts?: number | null
  solution?: string | null
  settings?: ActivitySettings | null
  feedbacks?: ExerciseFeedback[] | null
  theories?:
    | {
        url: string
        title: string
      }[]
    | null
  reviewMode?: boolean | null
  platon_logs?: string[] | null
}

export interface ActivityPlayer {
  type: 'activity'
  sessionId: string
  activityId?: string | null
  title: string
  author?: string | null
  introduction: string
  conclusion: string
  state: ActivityOpenStates
  serverTime: Date
  openAt?: Date | null
  closeAt?: Date | null
  startedAt?: Date | null
  lastGradedAt?: Date | null
  navigation: PlayerNavigation
  settings?: ActivitySettings | null
}

/** Representation of an exercise/activity player. */
export declare type Player = ExercisePlayer | ActivityPlayer

export interface PlayerActivityVariables extends ActivityVariables {
  navigation: PlayerNavigation
}

/**
 * Determines if an activity has timed out.
 *
 * The function prioritizes the `startedAt` time plus the `duration`. If either
 * `startedAt` or `duration` is not available, it falls back to using the `closeAt`
 * time.
 *
 * - If both `startedAt` and `duration` are available, it calculates the timeout based on `startedAt` + `duration`. This covers the case where the user leaves and resumes an activity, as the time continues even when the user is not active.
 * - If either `startedAt` or `duration` is not available, it falls back to using `closeAt` to determine if the activity is timeouted.
 * - If neither `closeAt` nor `startedAt` and `duration` are available, the function returns false, which means the activity is not considered timeouted.
 *
 * @param player - The activity player object containing the relevant time and settings.
 * @returns True if the activity is timeouted, false otherwise.
 */
export const isTimeouted = (player: Partial<ActivityPlayer>): boolean => {
  const closeAt = player.closeAt ? new Date(player.closeAt).getTime() : null
  const startedAt = player.startedAt ? new Date(player.startedAt).getTime() : null
  const duration = (player.settings?.duration || 0) * 1000

  // Get the current timestamp
  const currentTime = new Date().getTime()

  // Check if the activity is timeouted
  let isTimeouted = false

  if (duration && startedAt) {
    // Prioritize startedAt + duration
    isTimeouted = currentTime > startedAt + duration
  } else if (closeAt != null) {
    // Fallback to closeAt if startedAt or duration is not available
    isTimeouted = currentTime > closeAt
  }

  return isTimeouted
}

/**
 * Calculates the time at which the activity will be closed.
 *
 * The function prioritizes the startedAt time plus the duration. If either
 * startedAt or duration is not available, it falls back to using the closeAt
 * time.
 *
 * @param player - The activity player object containing the relevant time and settings.
 * @returns The timestamp at which the activity will be closed, or null if the closing time cannot be determined.
 */
export const getClosingTime = (player: Partial<ActivityPlayer>): number | null => {
  const startedAt = player.startedAt ? new Date(player.startedAt).getTime() : null
  const closeAt = player.closeAt ? new Date(player.closeAt).getTime() : null
  const duration = (player.settings?.duration || 0) * 1000
  let closingTime: number | null = null

  if (duration != 0 && startedAt != null) {
    closingTime = startedAt + duration
  }
  if (closeAt != null && (closingTime == null || closeAt < closingTime)) {
    closingTime = closeAt
  }

  return closingTime
}

export const NO_COPY_PASTER_CLASS_NAME = 'no-copy-paste'
