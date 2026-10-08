export enum CorrectionStatus {
  pending = 'pending',
  available = 'available',
}

export interface Correction {
  id: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  grade: number
}

export interface ActivityCorrectionSummary {
  activityId: string
  activityName: string
  courseId: string
  courseName: string
  totalExercises: number
  correctedExercises: number
  /** Submitted copies with at least one exercise still to correct. */
  pendingCopies: number
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

export interface CourseCorrection {
  courseId: string
  ActivityCorrections: ActivityCorrection[]
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

  /**
   * List of labels put on this student copy
   */
  labels: Label[]

  /**
   * Indicates if the exercise has any upload from the student
   * */
  hasUploads?: boolean
}

export interface UpsertCorrection {
  grade: number
  labels: CorrectionLabel[]
}

export interface CorrectionLabel {
  sessionId: string
  answerId: string
  labelId: string
}

export interface Label {
  id: string
  name: string
  description?: string
  color?: string
  gradeChange?: string
}

export interface CreateLabel {
  name: string
  description?: string
  color?: string
}
