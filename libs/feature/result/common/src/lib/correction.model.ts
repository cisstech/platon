export interface Correction {
  id: string
  createdAt: Date
  updatedAt?: Date
  authorId: string
  grade: number
}

export interface PendingCorrection {
  activityId: string
  activityName: string
  courseId: string
  courseName: string
  exercises: PendingCorrectionExercise[]
}

export interface PendingCorrectionExercise {
  userId: string
  activitySessionId: string
  exerciseSessionId: string
  exerciseId: string
  exerciseName: string
  correctedBy?: string
  correctedAt?: Date
  correctedGrade?: number
  grade?: number
}

export interface UpsertCorrection {
  grade: number
}
