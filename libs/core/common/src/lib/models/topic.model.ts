export interface Topic {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  name: string
}

export interface CreateTopic {
  readonly name: string
}

export type UpdateTopic = Partial<CreateTopic>
