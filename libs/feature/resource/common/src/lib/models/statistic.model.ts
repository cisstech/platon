export interface CircleResourceStatistic {
  readonly children: number
  readonly circles: number
  readonly exercises: number
  readonly activities: number
  readonly ready: number
  readonly deprecated: number
  readonly bugged: number
  readonly not_tested: number
  readonly draft: number
}

export interface ActivityResourceStatistic {
  readonly attemptCount: number
  readonly successRate: number
}

export interface ExerciseResourceStatistic {
  readonly attemptCount: number
  readonly successRate: number
}

export interface ResourceStatistic {
  readonly score: number
  readonly members: number
  readonly watchers: number

  readonly circle?: CircleResourceStatistic
  readonly activity?: ActivityResourceStatistic
  readonly exercise?: ExerciseResourceStatistic
}
