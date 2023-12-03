import { AnswerStates } from '@platon/feature/result/common'

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
    durationDistribution: Record<string, number>
    answerDistribution: Record<AnswerStates, number>
  }
}
