/* eslint-disable @typescript-eslint/no-explicit-any */

import { PlayerNavigation } from "./navigation.model";
import { PlayerSettings } from "./settings.model";
import { ExerciseFeedback } from "./variables.model";

export enum PlayerActions {
  NEXT_HINT = 'NEXT_HINT',
  CHECK_ANSWER = 'CHECK_ANSWER',
  NEXT_EXERCISE = 'NEXT_EXERCISE',
  SHOW_SOLUTION = 'SHOW_SOLUTION',
  REROLL_EXERCISE = 'REROLL_EXERCISE',
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
  courseActivityId: string;
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
  sessionId: string;
  form: string;
  title: string;
  statement: string;
  hints?: string[];
  author?: string;
  remainingAttempts?: number;
  solution?: string;
  settings?: PlayerSettings;
  feedbacks?: ExerciseFeedback[];
  theories?: {
    url: string;
    title: string;
  }[];
}

export interface ActivityPlayer {
  type: 'activity';
  sessionId: string;
  title: string;
  author?: string;
  introduction: string;
  conclusion: string;
  navigation: PlayerNavigation;
  settings?: PlayerSettings;
}

/** Representation of an exercise/activity player. */
export declare type Player = ExercisePlayer | ActivityPlayer;
