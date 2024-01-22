export interface Topic {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly name: string
}

export interface CreateTopic {
  readonly name: string
}

export type UpdateTopic = Partial<CreateTopic>
