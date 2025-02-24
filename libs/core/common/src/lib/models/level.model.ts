export interface Level {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  name: string
  existing?: boolean
}

export interface CreateLevel {
  readonly name: string
  readonly force?: boolean
}

export type UpdateLevel = Partial<CreateLevel>
