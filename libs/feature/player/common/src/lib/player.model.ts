/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ActivitySettings,
  ActivityVariables,
  ExerciseFeedback,
} from '@platon/feature/compiler';
import { AnswerStates } from '@platon/feature/result/common';

export enum PlayerActions {
  NEXT_HINT = 'NEXT_HINT',
  CHECK_ANSWER = 'CHECK_ANSWER',
  NEXT_EXERCISE = 'NEXT_EXERCISE',
  SHOW_SOLUTION = 'SHOW_SOLUTION',
  REROLL_EXERCISE = 'REROLL_EXERCISE',
}

export interface PlayerExercise {
  id: string;
  sessionId: string;
  state: AnswerStates;
  title: string;
}

export interface PlayerNavigation {
  started: boolean;
  terminated: boolean;
  current?: PlayerExercise;
  exercises: PlayerExercise[];
}

/**
 * Representation of the `/player/preview` endpoint body.
 */
export interface PreviewInput {
  /** Version of the resource to preview (default: latest) */
  version?: string;
  /** Id of the resource to preview. */
  resource: string;
}

/**
 * Representation of the `/player/play/answers` endpoint body.
 */
export interface PlayAnswersInput {
  /** Session id of the exercise.  */
  sessionId: string;
}

/**
 * Representation of the `/player/play/exercises` endpoint body.
 */
export interface PlayExerciseInput {
  /** Session id of the activity containing the exercises to be played.  */
  activitySessionId: string;
  /** A list of exercise sessions to start/resume. */
  exerciseSessionIds: string[];
}

/**
 * Representation of the `/player/play/activity` endpoint body.
 */
export interface PlayActivityInput {
  /** Identifier of the course activity to start/resume. */
  activityId: string;
}

/**
 * Representation of the `/player/evaluate` endpoint body.
 */
export interface EvalExerciseInput {
  /** Action to do. */
  action: PlayerActions;
  /** An exercise session. */
  sessionId: string;
  /** Current answers of the user inside of the exercise. */
  answers?: Record<string, any>;
}

export interface PreviewOuput {
  exercise?: ExercisePlayer;
  activity?: ActivityPlayer;
}

export interface PlayAnswersOutput {
  exercises: ExercisePlayer[];
}

export interface PlayExerciseOuput {
  exercises: ExercisePlayer[];
  navigation?: PlayerNavigation;
}

export interface PlayActivityOuput {
  activity: ActivityPlayer;
}

export interface EvalExerciseOutput {
  exercise: ExercisePlayer;
  navigation?: PlayerNavigation;
}

export interface ExercisePlayer {
  type: 'exercise';
  answerId?: string;
  sessionId: string;
  startedAt?: Date;
  lastGradedAt?: Date;
  form: string;
  title: string;
  statement: string;
  hints?: string[];
  author?: string;
  correction?: {
    grade: number;
    authorId?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  remainingAttempts?: number;
  solution?: string;
  settings?: ActivitySettings;
  feedbacks?: ExerciseFeedback[];
  theories?: {
    url: string;
    title: string;
  }[];
}

export interface ActivityPlayer {
  type: 'activity';
  sessionId: string;
  activityId?: string;
  title: string;
  author?: string;
  introduction: string;
  conclusion: string;
  openAt?: Date;
  closeAt?: Date;
  startedAt?: Date;
  lastGradedAt?: Date;
  navigation: PlayerNavigation;
  settings?: ActivitySettings;
}

/** Representation of an exercise/activity player. */
export declare type Player = ExercisePlayer | ActivityPlayer;

export interface PlayerActivityVariables extends ActivityVariables {
  navigation: PlayerNavigation;
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
  const closeAt = player.closeAt ? new Date(player.closeAt).getTime() : null;
  const startedAt = player.startedAt
    ? new Date(player.startedAt).getTime()
    : null;
  const duration = player.settings?.duration;

  // Get the current timestamp
  const currentTime = new Date().getTime();

  // Check if the activity is timeouted
  let isTimeouted = false;

  if (duration != null && startedAt != null) {
    // Prioritize startedAt + duration
    isTimeouted = currentTime > startedAt + duration;
  } else if (closeAt != null) {
    // Fallback to closeAt if startedAt or duration is not available
    isTimeouted = currentTime > closeAt;
  }

  return isTimeouted;
};

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
export const getClosingTime = (
  player: Partial<ActivityPlayer>
): number | null => {
  const startedAt = player.startedAt
    ? new Date(player.startedAt).getTime()
    : null;
  const closeAt = player.closeAt ? new Date(player.closeAt).getTime() : null;
  const duration = (player.settings?.duration || 0) * 1000;

  if (duration != null && startedAt != null) {
    return startedAt + duration;
  } else if (closeAt != null) {
    return closeAt;
  }

  return null;
};
