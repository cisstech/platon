export interface Level {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  name: string
}

export interface CreateLevel {
  readonly name: string
}

export type UpdateLevel = Partial<CreateLevel>
