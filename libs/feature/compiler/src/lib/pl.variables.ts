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
  /** Determines whether the hint button should be displayed or not. */
  empty: boolean
}

/**
 * Representation of items of `theories` array variable inside of an exercise source file.
 */
export interface ExerciseTheory {
  /** Title of the theory document. */
  title: string
  /** Url to the theory document. */
  url: string
}

/**
 * Representation of an exercise feedback.
 */
export interface ExerciseFeedback {
  type: 'success' | 'info' | 'warning' | 'error'
  content: string
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

  /** Variables managed by the player to keep track of some informations about the exercice status.  */
  ['.meta']?: {
    /** Number of attempts made by the user. */
    attempts?: number
    /** Sets to true once the `show solution` button is clicked. */
    showSolution?: boolean
    /** Number of hints consumed in case of static hints. */
    consumedHints?: number
  }

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

/**
 * List of special variables of an activity source file.
 */
export interface ActivityVariables {
  title: string
  introduction: string
  conclusion: string
  exerciseGroups: Record<string, ActivityExercise[]>

  author?: string
  settings?: ActivitySettings

  [k: string]: any
}

export const extractExercisesFromActivityVariables = (variables: ActivityVariables) => {
  const groups = variables.exerciseGroups || {}
  const exercises: ActivityExercise[] = []
  Object.keys(groups).forEach((group) => {
    groups[group]?.forEach((exercise) => {
      exercises.push(exercise)
    })
  })
  return exercises
}
