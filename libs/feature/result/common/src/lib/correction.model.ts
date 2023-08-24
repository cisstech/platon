export interface Correction {
  id: string
  createdAt: Date
  updatedAt?: Date
  authorId: string
  grade: number
}

/**
 * Represents a list of corrections assigned to a correctioner.
 */
export interface ActivityCorrection {
  /**
   * The id of the activity.
   */
  activityId: string

  /**
   * The name of the activity.
   */
  activityName: string

  /**
   * The id of the course the activity belongs to.
   */
  courseId: string

  /**
   * The name of the course the activity belongs to.
   */
  courseName: string

  /**
   * A list of exercises to correct (only terminated activity sessions exercises are listed)
   */
  exercises: ExerciseCorrection[]
}

/**
 * Represent information about an exercise to correct.
 */
export interface ExerciseCorrection {
  /**
   * The id of the user who answered the exercise.
   */
  userId: string

  /**
   * The id of the exercise activity's session.
   */
  activitySessionId: string

  /**
   * The id of the exercise session.
   */
  exerciseSessionId: string

  /**
   * The id of the exercise in it's activity navigation.
   */
  exerciseId: string

  /**
   * The name of the exercise in it's activity navigation.
   */
  exerciseName: string

  /**
   * The id of the user who corrected the exercise (if any).
   */
  correctedBy?: string

  /**
   * The date the exercise was corrected (if any).
   */
  correctedAt?: Date

  /**
   * The grade the exercise was corrected to (if any).
   */
  correctedGrade?: number

  /**
   * The max grade the user got for the exercise when he answered it.
   */
  grade?: number
}

export interface UpsertCorrection {
  grade: number
}
