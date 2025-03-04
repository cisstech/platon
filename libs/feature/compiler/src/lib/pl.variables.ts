/* eslint-disable @typescript-eslint/no-explicit-any */
import { PLSourceFile } from './pl.parser'
import { ActivitySettings } from './pl.settings'

export declare type Variables = {
  [k: string]: any
}

/**
 * Representation of `hint` variable inside of an exercise source file.
 */
export interface ExerciseHint {
  /** Script to be executed to check if there are any hint left */
  next: string
  /** List of dynamically generated hints. */
  data: string[]
  /** Determines whether there are more hints to show */
  done: boolean
}

/**
 * Representation of items of `theories` array variable inside of an exercise source file.
 */
export interface ExerciseTheory {
  /** Title of the theory document. */
  title: string

  /** Url to the theory document. */
  url: string

  /**
   * Determines whether the theory document should be displayed in preview mode.
   * - Only supported formats are displayed in preview mode.
   *  - Supported formats are listed in `ui-file-preview` component.
   * - If the format is not supported, the document is downloaded.
   */
  preview?: boolean
}

/** Variables managed by the player to keep track of some informations about the exercice status.  */

export interface ExerciseMeta {
  /**
   * Determines whether the exercise is in initial build state.
   */
  isInitialBuild: boolean

  /** List of grades obtained by the user order from least recent to most recent */
  grades: number[]

  /** Number of attempts made by the user (always set to 0 after reroll). */
  attempts?: number

  /**
   * Total number of attemps made by the user.
   */
  totalAttempts?: number

  /** Sets to true once the `show solution` button is clicked (always set to false after reroll). */
  showSolution?: boolean

  /** Number of hints consumed (always set to 0 after reroll) */
  consumedHints?: number
}

export interface ExerciseFoldableFeedbackContent {
  name: string
  description: string
  expected: string
  obtained: string
  arguments: string
  type: 'success' | 'info' | 'warning' | 'error'
  display: boolean
  feedbacks: ExerciseFoldableFeedbackContent[] | undefined
}

/**
 * Representation of an exercise feedback.
 */
export interface ExerciseFeedback {
  type: 'success' | 'info' | 'warning' | 'error' | 'none'
  content: string | ExerciseFoldableFeedbackContent[]
}

/**
 * List of special variables of an exercise source file.
 */
export interface ExerciseVariables {
  /** Template string to render inside the exercice answer area. */
  form: string
  /** Template string to render inside the exercice author area. */
  author?: string
  /** Template string to render inside the exercise title area. */
  title: string
  /** Template string to render inside the exercise statement area. */
  statement: string
  /** Script to execute on a sandbox to evaluate the exercise. */
  grader: string

  /** Optional script to execute on a sandbox to build the exercise.
   *  This script is executed only once and each time `reroll` action is called.
   */
  builder?: string

  /** Exercise static hints in case of string array of dynamic hints in case of an `ExerciseHint` object. */
  hint?: string[] | ExerciseHint
  /** List of theory documents associated to the exercise. */
  theories?: ExerciseTheory[]
  /** Template string that render the exericse solution. (should be defined by the builder script.) */
  solution?: string
  /** Feedback to be displayed in reaction to answers. (should be defined by the `grader` script.)  */
  feedback?: ExerciseFeedback | ExerciseFeedback[]

  /**
   * Seed used to generate random values.
   */
  seed: number

  /** Variables managed by the player to keep track of some informations about the exercice status.  */
  ['.meta']: ExerciseMeta
  /**
   * Temporary variable defined during rendering time to allow access .meta object from nunjucks templates.
   */
  meta?: ExerciseMeta

  /** Any other variables */
  [k: string]: any
}

export interface ActivityExercise {
  id: string
  resource: string
  version: string
  overrides?: Variables
  source: PLSourceFile
}

export type ActivityExerciseGroups = Record<string, ActivityExerciseGroup>

export interface ActivityExerciseGroup {
  name: string
  exercises: ActivityExercise[]
}

/**
 * List of special variables of an activity source file.
 */
export interface ActivityVariables {
  title: string
  introduction: string
  conclusion: string
  exerciseGroups: ActivityExerciseGroups

  author?: string
  settings?: ActivitySettings

  activityGrade?: number

  nextExerciseId?: string
  next?: string
  exercisesMeta?: Record<string, ExerciseMeta>
  currentExerciseId?: string

  [k: string]: any
}

/**
 * Extracts all exercises from all exercise groups of an activity variables.
 * @param variables Variables of an activity.
 * @returns List of exercises.
 */
export const extractExercisesFromActivityVariables = (variables: ActivityVariables) => {
  const groups = variables.exerciseGroups || {}
  const exercises: ActivityExercise[] = []
  Object.keys(groups).forEach((group) => {
    groups[group]?.exercises.forEach((exercise) => {
      exercises.push(exercise)
    })
  })
  return exercises
}

export const withExerciseMeta = (variables: ExerciseVariables): ExerciseVariables => {
  const current: ExerciseMeta = {
    ...variables['.meta'],
    grades: variables['.meta']?.grades ?? [],
    isInitialBuild: variables['.meta']?.isInitialBuild ?? true,
  }

  current.attempts = current.attempts ?? 0
  current.grades = current.grades ?? []
  current.isInitialBuild = current.isInitialBuild ?? true
  current.totalAttempts = current.totalAttempts ?? 0
  current.consumedHints = current.consumedHints ?? 0
  current.showSolution = current.showSolution ?? false

  variables['.meta'] = current

  return variables
}

export const patchExerciseMeta = (
  variables: ExerciseVariables,
  patch: (current: Required<ExerciseMeta>) => Partial<ExerciseMeta>
): ExerciseVariables => {
  withExerciseMeta(variables)
  variables['.meta'] = {
    ...variables['.meta'],
    ...patch(variables['.meta'] as Required<ExerciseMeta>),
  }
  return variables
}
