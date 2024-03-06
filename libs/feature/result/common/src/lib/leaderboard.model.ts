import { User } from '@platon/core/common'

export interface CourseLeaderboardEntry {
  readonly rank: number
  readonly user: User
  readonly points: number
}

export interface ActivityLeaderboardEntry {
  readonly rank: number
  readonly user: User
  readonly grade: number
  readonly points: number
  readonly startedAt: Date
  readonly succeededAt: Date
  readonly lastGradedAt: Date
}
export interface FindCourseLeaderboard {
  readonly courseId: string
  readonly limit?: number
}

export interface FindActivityLeaderboard {
  readonly activityId: string
  readonly limit?: number
}
