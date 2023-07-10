export interface Corrector {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly activityId: string
  readonly userId: string
  readonly users: string[]
}

export interface CreateCorrector {
  readonly userId: string
}
