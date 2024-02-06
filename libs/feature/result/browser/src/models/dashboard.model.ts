import { AnswerStates, ExerciseResults } from '@platon/feature/result/common'

export type UserDashboardModel = {
  user: {
    successRate: number
    averageScore: number
    totalDuration: number
    dropoutRate: number
    answerRate: number
    courseCount: number
    activityCount: number
    exerciseCount: number
    scoreDistribution: Record<string, number>
    answerDistribution: Record<AnswerStates, number>
    durationDistribution: Record<string, number>
  }
}

export type ResourceDashboardModel = {
  session: {
    successRate: number
    averageScore: number
    totalDuration: number
    averageDuration: number
    scoreDistribution: Record<string, number>
    answerDistribution: Record<AnswerStates, number>
    durationDistribution: Record<string, number>
  }
  exercise?: {
    answerRate: number
    dropoutRate: number
    totalAttempts: number
    averageAttempts: number
    averageTimeToAttempt: number
    successRateOnFirstAttempt: number
    averageAttemptsToSuccess: number
  }

  activity?: {
    usedInCourses: string[]
    answerRate: number
    dropoutRate: number
    totalAttempts: number
    exerciseResults: ExerciseResults[]
    totalCompletions: number
    usedInCoursesCount: number
  }
}
